"""
Seguridad y autenticación de PetroChat.
Verifica los tokens JWT de Supabase para proteger las rutas.
"""

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import obtener_configuracion

# Esquema de seguridad Bearer para extraer el token del header Authorization
esquema_seguridad = HTTPBearer()


async def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(esquema_seguridad),
) -> dict:
    """
    Dependencia de FastAPI que verifica el JWT de Supabase.
    Extrae el user_id y el email del token.
    
    Retorna un diccionario con:
        - user_id: ID único del usuario en Supabase
        - email: correo electrónico del usuario
    
    Lanza HTTP 401 si el token es inválido o expiró.
    """
    config = obtener_configuracion()
    token = credenciales.credentials

    try:
        # Decodificar y verificar el JWT usando el secreto de Supabase
        payload = jwt.decode(
            token,
            config.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )

        user_id = payload.get("sub")
        email = payload.get("email", "")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido: no contiene ID de usuario",
            )

        return {"user_id": user_id, "email": email}

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El token ha expirado. Iniciá sesión nuevamente.",
        )
    except jwt.InvalidTokenError as e:
        print(f"Error detallado de JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token de autenticación inválido: {str(e)}",
        )
