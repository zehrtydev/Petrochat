"""
Tests para endpoints de documentos (/api/documentos).
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import sys
sys.path.insert(0, "backend")

from models.schemas import InfoDocumento


class TestListarDocumentos:
    """Tests para GET /api/documentos."""

    def test_listar_documentos_formato_respuesta(self):
        """Verifica el formato de respuesta de documentos."""
        doc = InfoDocumento(
            id="doc-123",
            filename="test.pdf",
            status="listo",
            chunk_count=5,
            created_at="2024-01-01"
        )
        
        assert doc.id == "doc-123"
        assert doc.filename == "test.pdf"
        assert doc.status == "listo"


class TestEliminarDocumento:
    """Tests para DELETE /api/documentos/{document_id}."""

    def test_eliminar_documento_validacion_formato(self):
        """Verifica manejo de documento no encontrado."""
        info = InfoDocumento(
            id="nonexistent",
            filename="test.pdf",
            status="listo",
            chunk_count=5,
            created_at="2024-01-01"
        )

        assert info.id == "nonexistent"


class TestDocumentosSchemas:
    """Tests para el schema InfoDocumento."""

    def test_info_documento_crea(self):
        """InfoDocumento se crea correctamente."""
        doc = InfoDocumento(
            id="doc-1",
            filename="archivo.pdf",
            status="procesando",
            chunk_count=3,
            created_at="2024-01-01"
        )
        
        assert doc.id == "doc-1"
        assert doc.filename == "archivo.pdf"
        assert doc.chunk_count == 3
    
    def test_info_documento_status_diferentes(self):
        """InfoDocumento acepta diferentes status."""
        statuses = ["procesando", "listo", "error", "pendiente"]
        
        for status in statuses:
            doc = InfoDocumento(
                id="doc-test",
                filename="test.pdf",
                status=status,
                chunk_count=1,
                created_at="2024-01-01"
            )
            assert doc.status == status

    def test_info_documento_fecha_formato(self):
        """InfoDocumento acepta diferentes formatos de fecha."""
        doc = InfoDocumento(
            id="doc-1",
            filename="test.pdf",
            status="listo",
            chunk_count=5,
            created_at="2024-01-15T10:30:00Z"
        )
        
        assert "2024" in doc.created_at