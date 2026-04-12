"""
Service Registry centralizado para caché de servicios.
Proporciona instancias singleton de clientes externos.
"""

from typing import Any, Optional
from llama_index.llms.groq import Groq
from pinecone import Pinecone
from supabase import create_client, Client
from core.config import obtener_configuracion, Configuracion


class ServiceRegistry:
    _config: Optional[Configuracion] = None
    _llm_principal: Optional[Groq] = None
    _llm_fallback: Optional[Groq] = None
    _pinecone_client: Optional[Pinecone] = None
    _pinecone_index: Optional[Any] = None
    _supabase_client: Optional[Client] = None

    @classmethod
    def get_config(cls) -> Configuracion:
        if cls._config is None:
            cls._config = obtener_configuracion()
        return cls._config

    @classmethod
    def get_llm_principal(cls) -> Groq:
        if cls._llm_principal is None:
            config = cls.get_config()
            cls._llm_principal = Groq(
                model=config.GROQ_MODELO_PRINCIPAL,
                api_key=config.GROQ_API_KEY,
            )
        return cls._llm_principal

    @classmethod
    def get_llm_fallback(cls) -> Groq:
        if cls._llm_fallback is None:
            config = cls.get_config()
            cls._llm_fallback = Groq(
                model=config.GROQ_MODELO_FALLBACK,
                api_key=config.GROQ_API_KEY,
            )
        return cls._llm_fallback

    @classmethod
    def get_pinecone_client(cls) -> Pinecone:
        if cls._pinecone_client is None:
            config = cls.get_config()
            cls._pinecone_client = Pinecone(api_key=config.PINECONE_API_KEY)
        return cls._pinecone_client

    @classmethod
    def get_pinecone_index(cls) -> Any:
        if cls._pinecone_index is None:
            config = cls.get_config()
            client = cls.get_pinecone_client()
            cls._pinecone_index = client.Index(config.PINECONE_INDEX_NAME)
        return cls._pinecone_index

    @classmethod
    def get_supabase_client(cls) -> Client:
        if cls._supabase_client is None:
            config = cls.get_config()
            cls._supabase_client = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
        return cls._supabase_client

    @classmethod
    def reset(cls) -> None:
        cls._llm_principal = None
        cls._llm_fallback = None
        cls._pinecone_client = None
        cls._pinecone_index = None
        cls._supabase_client = None
        cls._config = None
