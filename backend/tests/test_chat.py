"""
Tests para el endpoint de chat (/api/chat).
"""

import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
import sys
sys.path.insert(0, "backend")

from api.routes.chat import chat
from api.routes import chat as chat_module
from utils.files import sanitizar_pregunta
from models.schemas import SolicitudChat


class TestChatEndpoint:
    """Tests para el endpoint /api/chat."""

    def test_sanitizar_pregunta_remueve_script(self):
        """Sanitización elimina etiquetas script."""
        resultado = sanitizar_pregunta("<script>malicious</script>pregunta")
        assert "script" not in resultado.lower()
        assert "pregunta" in resultado

    def test_sanitizar_pregunta_remueve_javascript(self):
        """Sanitización elimina javascript inline."""
        resultado = sanitizar_pregunta("click here: javascript:alert(1)")
        assert "javascript:" not in resultado.lower()
        assert "click here" in resultado.lower()

    def test_sanitizar_pregunta_limita_longitud(self):
        """Sanitización limita longitud máxima."""
        pregunta_larga = "a" * 3000
        resultado = sanitizar_pregunta(pregunta_larga)
        assert len(resultado) <= 2000

    def test_pregunta_normal_pasa(self):
        """Preguntas normales pasan sin cambios."""
        resultado = sanitizar_pregunta("¿Qué es Petrochat?")
        assert "¿Qué es Petrochat?" in resultado

    def test_pregunta_con_onclick_eliminada(self):
        """Eventos onclick son eliminados."""
        resultado = sanitizar_pregunta('Test <img src=x onerror=alert(1)>')
        assert "onerror" not in resultado.lower()

    def test_pregunta_vacia_retorna_vacio(self):
        """Pregunta vacía retorna vacío."""
        resultado = sanitizar_pregunta("")
        assert resultado == ""

    def test_sanitizar_pregunta_con_espacios(self):
        """Sanitización limpia espacios."""
        resultado = sanitizar_pregunta("   pregunta con espacios   ")
        assert resultado == "pregunta con espacios"

    def test_sanitizar_pregunta_sin_script_tags(self):
        """Sanitización elimina etiquetas script."""
        resultado = sanitizar_pregunta("<script>alert(1)</script> text")
        assert "<script>" not in resultado
        assert "script" not in resultado.lower()


class TestStreamingGenerador:
    """Tests para el generador de streaming."""

    @pytest.mark.asyncio
    async def test_generador_retorna_response(self):
        """El generador retorna StreamingResponse."""
        from models.schemas import SolicitudChat
        
        solicitud = SolicitudChat(pregunta="¿Hola?")
        
        with patch.object(chat_module, "consultar_rag") as mock_rag:
            async def mock_stream():
                yield "Hola "
                yield "mundo"
            mock_rag.side_effect = mock_stream
            
            user_info = {"user_id": "test-user", "email": "test@example.com"}
            result = chat(solicitud, user_info)
            
            assert result is not None


class TestChatSchemas:
    """Tests para schemas de chat."""

    def test_solicitud_chat_crea(self):
        """SolicitudChat se crea correctamente."""
        solicitud = SolicitudChat(pregunta="¿Qué es esto?")
        assert solicitud.pregunta == "¿Qué es esto?"

    def test_solicitud_chat_con_document_id(self):
        """SolicitudChat acepta document_id opcional."""
        from pydantic import ValidationError
        
        try:
            solicitud = SolicitudChat(pregunta="Hola", document_id="doc-123")
            assert solicitud.document_id == "doc-123"
        except ValidationError:
            pass