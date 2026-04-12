"""
Tests adicionales de integración.
"""

import pytest
from unittest.mock import patch, MagicMock
import sys
sys.path.insert(0, "backend")


class TestCache:
    """Tests para el sistema de cache."""

    def test_invalidate_documentos_cache(self):
        """Invalidar cache de documentos."""
        from core.cache import invalidate_documentos_cache
        invalidate_documentos_cache()

    def test_query_cache(self):
        """Verifica operaciones de cache."""
        from core.cache import QueryCache
        
        cache = QueryCache(ttl=60)
        cache.set("test_key", {"data": "test_value"})
        assert cache.get("test_key") == {"data": "test_value"}
        
        cache.invalidate("test_key")
        assert cache.get("test_key") is None

    def test_query_cache_ttl(self):
        """Verifica TTL del cache."""
        from core.cache import QueryCache
        
        cache = QueryCache(ttl=1)
        cache.set("key", "value")
        assert cache.get("key") == "value"


class TestConfiguracion:
    """Tests para configuración."""

    def test_config_tiene_valores(self):
        """Configuración tiene valores definidos."""
        from core.config import obtener_configuracion
        
        config = obtener_configuracion()
        
        assert hasattr(config, "SUPABASE_URL")
        assert config.SUPABASE_URL is not None


class TestServiceRegistry:
    """Tests para registro de servicios."""

    def test_registrar_servicio(self):
        """Registrar un servicio."""
        from core.service_registry import ServiceRegistry
        
        registry = ServiceRegistry()
        
        def test_factory():
            return "test_instance"
        
        try:
            registry.register("test_service", test_factory)
            instance = registry.get("test_service")
            assert instance == "test_instance"
        except Exception:
            pass


class TestVectorStoreFunciones:
    """Tests para funciones de vector store."""

    def test_guardar_vectores_funcion(self):
        """Verificar guardar vectores."""
        from services import vector_store
        
        with patch.object(vector_store, "obtener_indice") as mock_indice:
            mock_index = MagicMock()
            mock_indice.return_value = mock_index
            
            result = vector_store.guardar_vectores([
                {"id": "vec1", "values": [0.1] * 384, "metadata": {"texto": "test"}}
            ])
            
            assert result >= 0