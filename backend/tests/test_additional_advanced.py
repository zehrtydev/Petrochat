"""
Tests adicionales para aumentar coverage del backend.
Cubre: core/security.py, core/service_registry.py, services/embeddings.py
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock

import sys
sys.path.insert(0, "backend")


class TestServiceRegistry:
    """Tests para ServiceRegistry."""

    def test_reset_llama(self):
        from core.service_registry import ServiceRegistry
        
        ServiceRegistry._config = MagicMock()
        ServiceRegistry._llm_principal = MagicMock()
        ServiceRegistry._llm_fallback = MagicMock()
        ServiceRegistry._pinecone_client = MagicMock()
        ServiceRegistry._pinecone_index = MagicMock()
        
        ServiceRegistry.reset()
        
        assert ServiceRegistry._config is None
        assert ServiceRegistry._llm_principal is None
        assert ServiceRegistry._llm_fallback is None
        assert ServiceRegistry._pinecone_client is None
        assert ServiceRegistry._pinecone_index is None

    def test_get_config_retorna_configuracion(self, mock_config):
        from core.service_registry import ServiceRegistry
        ServiceRegistry._config = None
        
        config = ServiceRegistry.get_config()
        assert config is not None


class TestEmbeddings:
    """Tests para el servicio de embeddings."""

    def test_obtener_configuracion_embeddings_cache(self, mock_config):
        from services.embeddings import obtener_configuracion_embeddings
        from services.embeddings import obtener_configuracion_embeddings as func
        
        result1 = func()
        result2 = func()
        assert result1 is result2

    @pytest.mark.asyncio
    async def test_generar_embedding_exitoso(self, mock_config):
        from services.embeddings import generar_embedding
        
        with patch("httpx.post") as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = [[0.1] * 384]
            mock_post.return_value = mock_response
            
            result = generar_embedding("texto de prueba")
            assert len(result) == 384

    @pytest.mark.asyncio
    async def test_generar_embeddings_batch_exitoso(self, mock_config):
        from services.embeddings import generar_embeddings_batch
        
        with patch("httpx.post") as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = [[0.1] * 384, [0.2] * 384]
            mock_post.return_value = mock_response
            
            result = generar_embeddings_batch(["texto 1", "texto 2"])
            assert len(result) == 2


class TestDocumentLoader:
    """Tests para document_loader.py."""

    def test_extraer_texto_pdf(self, sample_pdf_bytes):
        from services.document_loader import extraer_texto
        
        with patch("pdfplumber.open") as mock_pdf:
            mock_page = MagicMock()
            mock_page.extract_text.return_value = "Texto del PDF"
            mock_pdf.return_value.__enter__.return_value.pages = [mock_page]
            
            result = extraer_texto(sample_pdf_bytes, "test.pdf")
            assert "Texto del PDF" in result

    def test_extraer_texto_formato_no_soportado(self, sample_pdf_bytes):
        from services.document_loader import extraer_texto
        
        with pytest.raises(ValueError):
            extraer_texto(sample_pdf_bytes, "test.exe")


class TestCache:
    """Tests para el sistema de cache."""

    def test_query_cache_set_get(self):
        from core.cache import QueryCache
        
        cache = QueryCache(ttl=60)
        cache.set("key1", {"data": "value"})
        
        result = cache.get("key1")
        assert result == {"data": "value"}

    def test_query_cache_expired(self):
        from core.cache import QueryCache
        import time
        
        cache = QueryCache(ttl=1)
        cache.set("key1", "value")
        
        time.sleep(1.1)
        result = cache.get("key1")
        assert result is None

    def test_query_cache_invalidate(self):
        from core.cache import QueryCache
        
        cache = QueryCache()
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        cache.invalidate("key1")
        
        assert cache.get("key1") is None
        assert cache.get("key2") == "value2"

    def test_query_cache_invalidate_prefix(self):
        from core.cache import QueryCache
        
        cache = QueryCache()
        cache.set("docs_1", "value1")
        cache.set("docs_2", "value2")
        cache.set("other", "value3")
        
        cache.invalidate_prefix("docs_")
        
        assert cache.get("docs_1") is None
        assert cache.get("docs_2") is None
        assert cache.get("other") == "value3"

    def test_query_cache_clear(self):
        from core.cache import QueryCache
        
        cache = QueryCache()
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        
        cache.clear()
        
        assert cache.get("key1") is None
        assert cache.get("key2") is None


class TestConfig:
    """Tests para configuration."""

    def test_config_con_todos_los_campos(self):
        from core.config import Configuracion
        
        config = Configuracion(
            SUPABASE_URL="https://test.supabase.co",
            SUPABASE_KEY="test-key",
            SUPABASE_JWT_SECRET="test-jwt",
            GROQ_API_KEY="test-groq",
            GROQ_MODELO_PRINCIPAL="llama-3.3-70b-versatile",
            GROQ_MODELO_FALLBACK="llama-3.1-8b-instant",
            PINECONE_API_KEY="test-pinecone",
            PINECONE_INDEX_NAME="test-index",
            HUGGINGFACE_API_KEY="test-hf",
            EMBEDDING_MODEL="BAAI/bge-small-en-v1.5",
            EMBEDDING_DIMENSION=384,
            CHUNK_SIZE=512,
            CHUNK_OVERLAP=50,
            TOP_K=5,
            FRONTEND_URL="http://localhost:5173",
        )
        
        assert config.SUPABASE_URL == "https://test.supabase.co"
        assert config.TOP_K == 5
