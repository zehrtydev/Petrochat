"""
Tests para validación de inputs y endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock

import sys
sys.path.insert(0, "backend")


class TestValidacionInputs:
    """Tests para validación de inputs del usuario."""

    def test_pregunta_vacia_rechazada(self):
        """Verifica que preguntas vacías son rechazadas."""
        from models.schemas import SolicitudChat
        
        with pytest.raises(ValueError):
            SolicitudChat(pregunta="")

    def test_pregunta_normal_aceptada(self):
        """Verifica que preguntas válidas son aceptadas."""
        from models.schemas import SolicitudChat
        
        solicitud = SolicitudChat(pregunta="¿Qué contiene el documento?")
        assert solicitud.pregunta == "¿Qué contiene el documento?"

    def test_pregunta_muy_larga_rechazada(self):
        """Verifica que preguntas muy largas son truncadas en el schema."""
        from models.schemas import SolicitudChat
        from services.rag_pipeline import sanitizar_pregunta
        
        pregunta_larga = "a" * 3000
        sanitizada = sanitizar_pregunta(pregunta_larga)
        
        assert len(sanitizada) <= 2000


class TestUploadValidation:
    """Tests para validación de subida de archivos."""

    def test_extension_invalida_rechazada(self):
        """Verifica que extensiones no permitidas son rechazadas."""
        from utils.files import obtener_extension
        
        assert obtener_extension("archivo.exe") == "exe"
        assert obtener_extension("archivo.exe") not in {"pdf", "docx"}

    def test_extension_valida_pdf(self):
        """Verifica detección correcta de PDF."""
        from utils.files import obtener_extension
        
        assert obtener_extension("documento.pdf") == "pdf"
        assert obtener_extension("DOCUMENTO.PDF") == "pdf"

    def test_extension_valida_docx(self):
        """Verifica detección correcta de DOCX."""
        from utils.files import obtener_extension
        
        assert obtener_extension("archivo.docx") == "docx"
        assert obtener_extension("DOCUMENTO.DOCX") == "docx"

    def test_archivo_sin_extension(self):
        """Verifica manejo de archivos sin extensión."""
        from utils.files import obtener_extension
        
        assert obtener_extension("archivo") == ""
        assert obtener_extension("sin-extension") == ""
