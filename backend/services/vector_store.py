"""
Servicio de almacenamiento vectorial con Pinecone.
Gestiona la conexión, inserción, consulta y eliminación de vectores.
"""

from pinecone import Pinecone
from core.config import obtener_configuracion

# Conexión global a Pinecone (se inicializa una sola vez)
_cliente_pinecone = None
_indice_pinecone = None


def obtener_indice():
    """
    Retorna la conexión al índice de Pinecone.
    Se inicializa una sola vez y se reutiliza.
    """
    global _cliente_pinecone, _indice_pinecone

    if _indice_pinecone is None:
        config = obtener_configuracion()
        _cliente_pinecone = Pinecone(api_key=config.PINECONE_API_KEY)
        _indice_pinecone = _cliente_pinecone.Index(config.PINECONE_INDEX_NAME)

    return _indice_pinecone


def guardar_vectores(
    vectores: list[dict],
) -> int:
    """
    Guarda vectores en Pinecone.
    
    Args:
        vectores: lista de diccionarios con formato:
            {
                "id": "id_unico",
                "values": [0.1, 0.2, ...],
                "metadata": {"user_id": "...", "document_id": "...", "texto": "..."}
            }
    
    Returns:
        Cantidad de vectores guardados
    """
    indice = obtener_indice()

    # Pinecone acepta batches de hasta 100 vectores
    TAMANO_BATCH = 100
    total_guardados = 0

    for i in range(0, len(vectores), TAMANO_BATCH):
        batch = vectores[i : i + TAMANO_BATCH]
        indice.upsert(vectors=batch)
        total_guardados += len(batch)

    return total_guardados


def consultar_vectores(
    embedding_consulta: list[float],
    user_id: str,
    top_k: int = 5,
    document_id: str | None = None,
) -> list[dict]:
    """
    Busca los vectores más similares en Pinecone.
    Filtra por user_id para que cada usuario solo vea sus documentos.
    
    Args:
        embedding_consulta: vector de la pregunta del usuario
        user_id: ID del usuario (para filtrar)
        top_k: cantidad de resultados a retornar
        document_id: filtrar por documento específico (opcional)
    
    Returns:
        Lista de resultados con score y metadata
    """
    indice = obtener_indice()

    # Construir filtro de metadata
    filtro = {"user_id": {"$eq": user_id}}
    if document_id:
        filtro["document_id"] = {"$eq": document_id}

    resultados = indice.query(
        vector=embedding_consulta,
        top_k=top_k,
        include_metadata=True,
        filter=filtro,
    )

    # Formatear resultados
    fragmentos = []
    for match in resultados.get("matches", []):
        fragmentos.append({
            "texto": match["metadata"].get("texto", ""),
            "score": match["score"],
            "document_id": match["metadata"].get("document_id", ""),
            "filename": match["metadata"].get("filename", ""),
        })

    return fragmentos


def eliminar_vectores(document_id: str, user_id: str) -> None:
    """
    Elimina todos los vectores asociados a un documento.
    
    Args:
        document_id: ID del documento a eliminar
        user_id: ID del usuario dueño (verificación de seguridad)
    """
    indice = obtener_indice()

    # Eliminar por filtro de metadata
    indice.delete(
        filter={
            "user_id": {"$eq": user_id},
            "document_id": {"$eq": document_id},
        }
    )
