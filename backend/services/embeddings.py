"""
Servicio de generación de embeddings.
Usa HuggingFace BGE-small como modelo por defecto.
Arquitectura preparada para cambiar el modelo fácilmente.
"""

from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from core.config import obtener_configuracion

# Variable global para reusar el modelo (se carga una sola vez)
_modelo_embeddings = None


def obtener_modelo_embeddings() -> HuggingFaceEmbedding:
    """
    Retorna la instancia del modelo de embeddings.
    Se inicializa una sola vez y se reutiliza (singleton).
    
    Para cambiar de modelo en el futuro, solo hay que modificar
    la variable EMBEDDING_MODEL en el archivo .env
    """
    global _modelo_embeddings

    if _modelo_embeddings is None:
        config = obtener_configuracion()
        _modelo_embeddings = HuggingFaceEmbedding(
            model_name=config.EMBEDDING_MODEL,
        )

    return _modelo_embeddings


def generar_embedding(texto: str) -> list[float]:
    """
    Genera el embedding (vector numérico) de un texto.
    
    Args:
        texto: texto a convertir en vector
    
    Returns:
        Lista de floats representando el vector del texto
    """
    modelo = obtener_modelo_embeddings()
    return modelo.get_text_embedding(texto)


def generar_embeddings_batch(textos: list[str]) -> list[list[float]]:
    """
    Genera embeddings para múltiples textos a la vez.
    Más eficiente que llamar uno por uno.
    
    Args:
        textos: lista de textos a convertir en vectores
    
    Returns:
        Lista de vectores, uno por cada texto
    """
    modelo = obtener_modelo_embeddings()
    return modelo.get_text_embedding_batch(textos)
