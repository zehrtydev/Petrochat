"""
Servicio de división de texto en fragmentos (chunking).
Usa LlamaIndex SentenceSplitter para dividir texto de forma inteligente.
"""

from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.schema import TextNode
from core.config import obtener_configuracion


def dividir_texto(
    texto: str,
    document_id: str,
    filename: str,
    user_id: str,
) -> list[TextNode]:
    """
    Divide el texto en fragmentos (chunks) usando SentenceSplitter.
    Cada fragmento incluye metadata para identificarlo en Pinecone.
    
    Args:
        texto: texto completo del documento
        document_id: ID único del documento
        filename: nombre del archivo original
        user_id: ID del usuario dueño del documento
    
    Returns:
        Lista de TextNode con el texto fragmentado y metadata
    """
    config = obtener_configuracion()

    # SentenceSplitter divide por oraciones respetando el tamaño del chunk
    splitter = SentenceSplitter(
        chunk_size=config.CHUNK_SIZE,
        chunk_overlap=config.CHUNK_OVERLAP,
    )

    # Crear un nodo base con todo el texto
    nodos_texto = [
        TextNode(
            text=texto,
            metadata={
                "user_id": user_id,
                "document_id": document_id,
                "filename": filename,
            },
        )
    ]

    # Dividir en fragmentos más pequeños
    fragmentos = splitter.get_nodes_from_documents(nodos_texto)

    return fragmentos
