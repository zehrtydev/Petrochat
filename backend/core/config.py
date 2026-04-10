"""
Configuración central del proyecto PetroChat.
Carga todas las variables de entorno necesarias usando Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Configuracion(BaseSettings):
    """Configuración del proyecto cargada desde variables de entorno."""

    # --- Groq (LLM) ---
    GROQ_API_KEY: str
    GROQ_MODELO_PRINCIPAL: str = "llama3-70b-8192"
    GROQ_MODELO_FALLBACK: str = "mixtral-8x7b-32768"

    # --- Pinecone (Base de datos vectorial) ---
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = "petrochat"

    # --- Supabase ---
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_JWT_SECRET: str

    # --- General ---
    FRONTEND_URL: str = "http://localhost:5173"

    # --- Embeddings ---
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    EMBEDDING_DIMENSION: int = 384

    # --- RAG ---
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 50
    TOP_K: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def obtener_configuracion() -> Configuracion:
    """
    Retorna la configuración del proyecto.
    Se usa lru_cache para que solo se cargue una vez en memoria.
    """
    return Configuracion()
