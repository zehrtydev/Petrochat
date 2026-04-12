"""
Tests para el cliente de Groq.
"""

import pytest
from unittest.mock import patch, MagicMock, AsyncMock

import sys
sys.path.insert(0, "backend")

from services.groq_client import obtener_llm_principal, generar_respuesta_stream


class TestGroqClient:
    """Tests para el cliente de Groq."""

    def test_obtener_llm_principal_retorna_instancia(self, mock_config):
        """Verifica que obtener_llm_principal retorna una instancia."""
        with patch("services.groq_client.Groq") as mock_groq:
            mock_groq_instance = MagicMock()
            mock_groq.return_value = mock_groq_instance
            
            llm = obtener_llm_principal()
            
            assert llm is not None
            mock_groq.assert_called_once()

    @pytest.mark.asyncio
    async def test_generar_respuesta_stream_falla_y_lanza_excepcion(self, mock_config):
        """Verifica que errores son manejados lanzando excepción."""
        with patch("services.groq_client.obtener_llm_principal") as mock_get_llm:
            mock_llm = MagicMock()
            mock_get_llm.return_value = mock_llm
            mock_llm.astream_complete.side_effect = Exception("API Error")
            
            with patch("services.groq_client.obtener_llm_fallback") as mock_fallback:
                mock_llm_fb = MagicMock()
                mock_fallback.return_value = mock_llm_fb
                mock_llm_fb.astream_complete.side_effect = Exception("Fallback also failed")
                
                with pytest.raises(RuntimeError) as exc_info:
                    async for _ in generar_respuesta_stream("prompt"):
                        pass
                
                assert "Error al generar respuesta" in str(exc_info.value)


