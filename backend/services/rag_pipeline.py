"""
Pipeline RAG (Retrieval-Augmented Generation) de PetroChat.
Orquesta todo el flujo: ingesta de documentos y consultas con contexto.
"""

import uuid
from services.document_loader import extraer_texto
from services.chunking import dividir_texto
from services.embeddings import generar_embedding, generar_embeddings_batch
from services.vector_store import guardar_vectores, consultar_vectores, eliminar_vectores
from services.groq_client import generar_respuesta_stream


# Prompt del sistema para el chatbot
PROMPT_SISTEMA = """Eres PetroChat, un asistente inteligente especializado en analizar documentos.
Tu trabajo es responder preguntas basándote ÚNICAMENTE en el contexto proporcionado.

Reglas:
1. Respondé siempre en español
2. Basá tu respuesta SOLO en el contexto dado
3. Si el contexto no contiene la información necesaria, decilo claramente
4. Sé conciso pero completo
5. Si citás información del contexto, indicá de qué parte proviene
6. Usá formato markdown cuando sea útil (listas, negritas, etc.)
"""


async def procesar_documento(
    contenido_bytes: bytes,
    nombre_archivo: str,
    user_id: str,
) -> dict:
    """
    Pipeline completo de ingesta de un documento:
    1. Extraer texto del archivo
    2. Dividir en fragmentos
    3. Generar embeddings
    4. Guardar en Pinecone
    
    Args:
        contenido_bytes: contenido del archivo en bytes
        nombre_archivo: nombre original del archivo
        user_id: ID del usuario que sube el documento
    
    Returns:
        Diccionario con document_id y cantidad de fragmentos
    """
    # Generar ID único para el documento
    document_id = str(uuid.uuid4())

    # 1. Extraer texto del documento
    texto = extraer_texto(contenido_bytes, nombre_archivo)

    if not texto.strip():
        raise ValueError("No se pudo extraer texto del documento. El archivo puede estar vacío o dañado.")

    # 2. Dividir el texto en fragmentos
    fragmentos = dividir_texto(texto, document_id, nombre_archivo, user_id)

    if not fragmentos:
        raise ValueError("No se pudieron generar fragmentos del documento.")

    # 3. Generar embeddings para todos los fragmentos
    textos_fragmentos = [nodo.text for nodo in fragmentos]
    embeddings = generar_embeddings_batch(textos_fragmentos)

    # 4. Preparar vectores para Pinecone
    vectores = []
    for i, (nodo, embedding) in enumerate(zip(fragmentos, embeddings)):
        vector_id = f"{document_id}_{i}"
        vectores.append({
            "id": vector_id,
            "values": embedding,
            "metadata": {
                "user_id": user_id,
                "document_id": document_id,
                "filename": nombre_archivo,
                "texto": nodo.text[:1000],  # Limitar texto en metadata (Pinecone tiene límite)
                "chunk_index": i,
            },
        })

    # 5. Guardar en Pinecone
    total_guardados = guardar_vectores(vectores)

    return {
        "document_id": document_id,
        "chunk_count": total_guardados,
        "filename": nombre_archivo,
    }


async def consultar_rag(
    pregunta: str,
    user_id: str,
    document_id: str | None = None,
):
    """
    Pipeline completo de consulta RAG con streaming:
    1. Generar embedding de la pregunta
    2. Buscar contexto relevante en Pinecone
    3. Construir prompt con contexto
    4. Generar respuesta con Groq (streaming)
    
    Args:
        pregunta: pregunta del usuario
        user_id: ID del usuario (para filtrar documentos)
        document_id: ID del documento específico (opcional)
    
    Yields:
        Fragmentos de la respuesta (streaming)
    """
    from core.config import obtener_configuracion
    config = obtener_configuracion()

    # 1. Generar embedding de la pregunta
    embedding_pregunta = generar_embedding(pregunta)

    # 2. Buscar contexto relevante en Pinecone
    resultados = consultar_vectores(
        embedding_consulta=embedding_pregunta,
        user_id=user_id,
        top_k=config.TOP_K,
        document_id=document_id,
    )

    # 3. Construir el contexto a partir de los fragmentos recuperados
    if not resultados:
        yield "No encontré información relevante en tus documentos para responder esta pregunta. Asegurate de haber subido los documentos correctos."
        return

    contexto = "\n\n---\n\n".join([
        f"[Fuente: {r['filename']}]\n{r['texto']}"
        for r in resultados
    ])

    # 4. Construir el prompt completo
    prompt = f"""{PROMPT_SISTEMA}

CONTEXTO DE LOS DOCUMENTOS:
{contexto}

PREGUNTA DEL USUARIO:
{pregunta}

RESPUESTA:"""

    # 5. Generar respuesta con streaming
    async for fragmento in generar_respuesta_stream(prompt):
        yield fragmento


async def eliminar_documento_rag(document_id: str, user_id: str) -> None:
    """
    Elimina todos los vectores de un documento de Pinecone.
    
    Args:
        document_id: ID del documento a eliminar
        user_id: ID del usuario dueño
    """
    eliminar_vectores(document_id, user_id)
