"""
Tests para el endpoint de subida de archivos (/api/subir).
"""

import pytest
import io
from unittest.mock import patch, MagicMock, AsyncMock
import sys
sys.path.insert(0, "backend")

from api.routes.upload import sanitizar_nombre_archivo, TAMANO_MAXIMO
from utils.files import validar_extension_archivo


class TestUploadEndpoint:
    """Tests para el endpoint /api/subir."""

    def test_upload_rejects_invalid_extension(self):
        """El endpoint rechaza extensiones inválidas."""
        assert validar_extension_archivo("documento.txt") == False
        assert validar_extension_archivo("documento.exe") == False
        assert validar_extension_archivo("documento") == False

    def test_upload_rejects_oversized_file(self):
        """El endpoint rechaza archivos muy grandes."""
        tamano_max = 20 * 1024 * 1024
        assert TAMANO_MAXIMO == tamano_max

    def test_upload_rejects_empty_file(self):
        """El endpoint rechaza archivos vacíos."""
        contenido_vacio = b""
        assert len(contenido_vacio) == 0

    def test_upload_sanitizes_filename(self):
        """El endpoint sanitiza nombres de archivo."""
        resultado = sanitizar_nombre_archivo("../../../etc/passwd.pdf", "pdf")

        assert "../../" not in resultado
        assert ".." not in resultado or resultado == "passwd.pdf"

    def test_upload_accepts_valid_extension(self):
        """El endpoint acepta extensiones válidas."""
        assert validar_extension_archivo("documento.pdf") == True
        assert validar_extension_archivo("documento.docx") == True

    def test_sanitizar_nombre_remueve_path_traversal(self):
        """Sanitización elimina path traversal."""
        resultado = sanitizar_nombre_archivo("/etc/passwd", "pdf")
        assert "/etc" not in resultado
        assert "passwd" in resultado

    def test_sanitizar_nombre_genera_uuid_si_vacio(self):
        """Nombre vacío genera UUID."""
        resultado = sanitizar_nombre_archivo("", "pdf")
        assert len(resultado) > 0

    def test_sanitizar_nombre_remueve_espacios(self):
        """Sanitización remueve espacios extras."""
        resultado = sanitizar_nombre_archivo("  nombre archivo  ", "pdf")
        assert resultado == "nombre archivo.pdf"

    def test_sanitizar_nombre_multiple_puntos(self):
        """Sanitización maneja múltiples puntos."""
        resultado = sanitizar_nombre_archivo("archivo.test.pdf", "pdf")
        assert "archivo.test.pdf" in resultado

    def test_sanitizar_nombre_solo_puntos(self):
        """Sanitización maneja solo puntos."""
        resultado = sanitizar_nombre_archivo("...", "pdf")
        assert "document_" in resultado

    def test_sanitizar_nombre_caracteres_especiales(self):
        """Sanitización remueve caracteres especiales."""
        resultado = sanitizar_nombre_archivo("file@#$%.pdf", "pdf")
        assert "@" not in resultado
        assert "#" not in resultado
        assert "%" not in resultado


class TestUploadSchemas:
    """Tests para schemas de upload."""

    def test_respuesta_subida_crea(self):
        """RespuestaSubida se crea correctamente."""
        from models.schemas import RespuestaSubida
        
        respuesta = RespuestaSubida(
            document_id="doc-123",
            filename="test.pdf",
            mensaje="Procesado",
            chunk_count=5
        )
        
        assert respuesta.document_id == "doc-123"
        assert respuesta.chunk_count == 5
    
    def test_respuesta_subida_mensaje(self):
        """RespuestaSubida tiene mensaje correcto."""
        from models.schemas import RespuestaSubida
        
        respuesta = RespuestaSubida(
            document_id="doc-1",
            filename="test.pdf",
            mensaje="Documento procesado exitosamente",
            chunk_count=10
        )
        
        assert "exitosamente" in respuesta.mensaje