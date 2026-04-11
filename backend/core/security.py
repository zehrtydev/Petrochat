"""
Seguridad y autenticación de PetroChat.
Verifica los tokens JWT de Supabase (HS256 o ES256) para proteger las rutas.
"""

import jwt
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import obtener_configuracion

# Esquema de seguridad Bearer para extraer el token del header Authorization
esquema_seguridad = HTTPBearer()

# Cache para las llaves públicas de Supabase (JWKS)
_jwks_cache = None


async def obtener_jwks() -> dict:
    """
    Descarga las llaves públicas oficiales de Supabase (JWKS).
    Se usa para validar tokens firmados con ES256.
    """
    global _jwks_cache
    if _jwks_cache is None:
        config = obtener_configuracion()
        # La URL estándar de JWKS en Supabase
        url = f"{config.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=10.0)
                if response.status_code == 200:
                    _jwks_cache = response.json()
                else:
                    # En algunos proyectos la URL puede ser ligeramente distinta
                    url_alt = f"{config.SUPABASE_URL}/auth/v1/jwks"
                    response = await client.get(url_alt, timeout=10.0)
                    _jwks_cache = response.json()
            except Exception as e:
                print(f"Error al descargar JWKS: {e}")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Error al conectar con el servidor de autenticación."
                )
    return _jwks_cache


async def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(esquema_seguridad),
) -> dict:
    """
    Dependencia de FastAPI que verifica el JWT de Supabase.
    Detecta automáticamente si el token es HS256 (simétrico) o ES256 (asimétrico).
    """
    config = obtener_configuracion()
    token = credenciales.credentials

    try:
        # 1. Obtener la cabecera para saber qué algoritmo y llave usar
        header = jwt.get_unverified_header(token)
        algoritmo = header.get("alg")
        kid = header.get("kid")

        # 2. Elegir el método de validación según el algoritmo
        if algoritmo == "ES256":
            # Autenticación asimétrica (Nuevos proyectos Supabase)
            jwks = await obtener_jwks()
            llave_publica = None
            
            # Buscar la llave que coincida con el 'kid' del token
            for key in jwks.get("keys", []):
                if key.get("kid") == kid:
                    # PyJWT sabe convertir JWK a objeto de llave automáticamente
                    llave_publica = jwt.algorithms.RSAAlgorithm.from_jwk(key) if key["kty"] == "RSA" \
                                   else jwt.algorithms.ECAlgorithm.from_jwk(key)
                    break
            
            if not llave_publica:
                raise Exception("No se encontró la llave pública necesaria.")

            payload = jwt.decode(
                token,
                llave_publica,
                algorithms=["ES256"],
                audience="authenticated",
            )
        else:
            # Autenticación simétrica clásica (HS256)
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
    except Exception as e:
        print(f"Error de validación JWT: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token de autenticación inválido: {str(e)}",
        )
