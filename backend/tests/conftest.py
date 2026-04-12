"""
Configuración global de pytest para los tests del backend.
"""

import pytest
import sys
from unittest.mock import MagicMock, AsyncMock, patch
from fastapi.testclient import TestClient


@pytest.fixture
def mock_config():
    """Mock de la configuración para tests."""
    with patch("core.config.obtener_configuracion") as mock:
        config = MagicMock()
        config.SUPABASE_URL = "https://test.supabase.co"
        config.SUPABASE_KEY = "test-key"
        config.SUPABASE_JWT_SECRET = "test-secret"
        config.GROQ_API_KEY = "test-groq-key"
        config.GROQ_MODELO_PRINCIPAL = "llama-3.3-70b-versatile"
        config.GROQ_MODELO_FALLBACK = "llama-3.1-8b-instant"
        config.PINECONE_API_KEY = "test-pinecone-key"
        config.PINECONE_INDEX_NAME = "petrochat-test"
        config.HUGGINGFACE_API_KEY = "test-hf-key"
        config.EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"
        config.EMBEDDING_DIMENSION = 384
        config.CHUNK_SIZE = 512
        config.CHUNK_OVERLAP = 50
        config.TOP_K = 5
        mock.return_value = config
        yield config


@pytest.fixture
def mock_supabase():
    """Mock del cliente de Supabase."""
    with patch("supabase.create_client") as mock:
        client = MagicMock()
        mock.return_value = client
        yield client


@pytest.fixture
def mock_pinecone():
    """Mock de Pinecone."""
    with patch("pinecone.Pinecone") as mock:
        client = MagicMock()
        index = MagicMock()
        client.Index.return_value = index
        mock.return_value = client
        yield {"client": client, "index": index}


@pytest.fixture
def mock_jwks():
    """JWKS de prueba para validación JWT."""
    return {
        "keys": [
            {
                "kty": "EC",
                "kid": "test-key-id",
                "crv": "P-256",
                "x": "WjX3aVMOBN8xUqKjJ7Yk5DzQ7Wq4t5fI-j9X0kLhT9E",
                "y": "iJqX2mR-qYpH-k7s2FzX8xT6qW5rP4cM1uK3dN9sH8",
            }
        ]
    }


@pytest.fixture
def test_user():
    """Usuario de prueba."""
    return {
        "user_id": "test-user-123",
        "email": "test@example.com"
    }


@pytest.fixture
def sample_pdf_bytes():
    """Contenido PDF mínimo de prueba."""
    return b"%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<</Root 1 0 R>>\n%%EOF"


@pytest.fixture
def sample_docx_bytes():
    """Contenido DOCX mínimo de prueba (ZIP válido)."""
    import zipfile
    import io
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w') as zf:
        zf.writestr("[Content_Types].xml", "<?xml version='1.0'?><Types xmlns='http://schemas.openxmlformats.org/package/2006/content-types'/>")
        zf.writestr("word/document.xml", "<?xml version='1.0'?><document><body><p>Test content</p></body></document>")
    
    zip_buffer.seek(0)
    return zip_buffer.read()
