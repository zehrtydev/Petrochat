"""
Rutas de autenticación.
Verifica el token JWT de Supabase y retorna información del usuario.
"""

from fastapi import APIRouter, Depends
from core.security import obtener_usuario_actual
from models.schemas import InfoUsuario

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


@router.get("/verificar", response_model=InfoUsuario)
async def verificar_token(usuario: dict = Depends(obtener_usuario_actual)):
    """
    Verifica que el token JWT sea válido.
    Retorna la información del usuario autenticado.
    """
    return InfoUsuario(
        user_id=usuario["user_id"],
        email=usuario["email"],
    )
