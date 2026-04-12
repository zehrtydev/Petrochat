"""
Tests para el endpoint de autenticación (/api/auth/verificar).
"""

import pytest
from unittest.mock import patch, MagicMock
import sys
sys.path.insert(0, "backend")

from api.routes.auth import verificar_token
from models.schemas import InfoUsuario


class TestAuthEndpoint:
    """Tests para el endpoint /api/auth/verificar."""

    @pytest.mark.asyncio
    async def test_auth_endpoint_returns_user_info(self):
        """El endpoint retorna información del usuario authenticado."""
        user_info = {"user_id": "user-123", "email": "test@example.com"}
        
        result = await verificar_token(user_info)
        
        assert isinstance(result, InfoUsuario)
        assert result.user_id == "user-123"
        assert result.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_auth_endpoint_returns_otro_usuario(self):
        """El endpoint retorna info de otro usuario."""
        user_info = {"user_id": "user-456", "email": "otro@example.com"}
        
        result = await verificar_token(user_info)
        
        assert result.user_id == "user-456"


class TestAuthSchemas:
    """Tests para el schema InfoUsuario."""

    def test_info_usuario_crea_correctamente(self):
        """InfoUsuario se crea correctamente."""
        info = InfoUsuario(user_id="user-123", email="test@example.com")
        
        assert info.user_id == "user-123"
        assert info.email == "test@example.com"
    
    def test_info_usuario_email_vacio(self):
        """InfoUsuario permite email vacío."""
        info = InfoUsuario(user_id="user-999", email="")
        
        assert info.email == ""