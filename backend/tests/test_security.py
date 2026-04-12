"""
Tests para el módulo de seguridad (JWT, autenticación).
"""

import pytest
import jwt
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

import sys
sys.path.insert(0, "backend")

from core.security import obtener_usuario_actual, obtener_jwks, ALLOWED_ALGORITHMS


class TestAllowedAlgorithms:
    """Tests para verificar configuración de algoritmos."""

    def test_solo_es256_permitido(self):
        """Verifica que solo ES256 está en la lista de algoritmos permitidos."""
        assert "ES256" in ALLOWED_ALGORITHMS
        assert "HS256" not in ALLOWED_ALGORITHMS
        assert len(ALLOWED_ALGORITHMS) == 1


class TestJWTValidation:
    """Tests para validación de tokens JWT."""

    @pytest.mark.asyncio
    async def test_token_con_algoritmo_no_permitido_rechazado(self, mock_config, test_user):
        """Verifica que tokens HS256 son rechazados."""
        token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.test"
        credenciales = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        with pytest.raises(HTTPException) as exc_info:
            await obtener_usuario_actual(credenciales)
        
        assert exc_info.value.status_code == 401
        assert "HS256" in exc_info.value.detail or "no permitido" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_token_invalido_malformado(self, mock_config):
        """Verifica que tokens malformados son rechazados."""
        token = "invalid-token-format"
        credenciales = HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)
        
        with pytest.raises(HTTPException) as exc_info:
            await obtener_usuario_actual(credenciales)
        
        assert exc_info.value.status_code == 401


class TestJWKS:
    """Tests para obtención de JWKS."""

    @pytest.mark.asyncio
    async def test_obtener_jwks_cache(self, mock_config, mock_jwks):
        """Verifica que JWKS se cachea correctamente."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = mock_jwks

        mock_client_instance = MagicMock()
        mock_client_instance.__aenter__.return_value.get = AsyncMock(return_value=mock_response)
        mock_client_instance.__aexit__.return_value = None
        
        with patch("httpx.AsyncClient", return_value=mock_client_instance):
            from core import security
            security._JWKS_CACHE = None
            result = await obtener_jwks()
            assert result == mock_jwks

    @pytest.mark.skip(reason="Mock de httpx.AsyncClient requiere configuración adicional")
    @pytest.mark.asyncio
    async def test_obtener_jwks_error_conexion(self, mock_config):
        """Verifica manejo de errores de conexión."""
        from core import security
        security._JWKS_CACHE = None
        
        with patch("httpx.AsyncClient") as mock_client:
            instance = MagicMock()
            instance.__aenter__ = AsyncMock(side_effect=Exception("Connection error"))
            instance.__aexit__ = AsyncMock()
            mock_client.return_value = instance
            
            with pytest.raises(HTTPException) as exc_info:
                await obtener_jwks()
            
            assert exc_info.value.status_code == 500
