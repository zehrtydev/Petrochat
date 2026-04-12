"""
Seguridad y autenticación de PetroChat.
Verifica los tokens JWT de Supabase (solo ES256) para proteger las rutas.
"""

import logging
import time
import jwt
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.config import obtener_configuracion
from utils.validacion import verificar_prompt_injection, sanitizar_html_peligroso

logger = logging.getLogger(__name__)

ESQUEMA_SEGURIDAD = HTTPBearer()

_JWKS_CACHE: dict | None = None
_JWKS_CACHE_TIME: float = 0
_JWKS_TTL: int = 3600  # Revalidar JWKS cada 1 hora

ALLOWED_ALGORITHMS = ["ES256"]


async def obtener_jwks() -> dict:
    """
    Descarga las llaves públicas oficiales de Supabase (JWKS).
    Se usa para validar tokens firmados con ES256.
    Cachea el resultado por _JWKS_TTL segundos.
    """
    global _JWKS_CACHE, _JWKS_CACHE_TIME
    ahora = time.time()

    if _JWKS_CACHE is not None and (ahora - _JWKS_CACHE_TIME) < _JWKS_TTL:
        return _JWKS_CACHE

    config = obtener_configuracion()
    url = f"{config.SUPABASE_URL}/auth/v1/.well-known/jwks.json"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=10.0)
            if response.status_code == 200:
                _JWKS_CACHE = response.json()
                _JWKS_CACHE_TIME = ahora
            else:
                url_alt = f"{config.SUPABASE_URL}/auth/v1/jwks"
                response = await client.get(url_alt, timeout=10.0)
                _JWKS_CACHE = response.json()
                _JWKS_CACHE_TIME = ahora
        except Exception as e:
            logger.error(f"Error al descargar JWKS: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al conectar con el servidor de autenticación."
            )
    return _JWKS_CACHE


def _limpiar_cache_jwks():
    global _JWKS_CACHE, _JWKS_CACHE_TIME
    _JWKS_CACHE = None
    _JWKS_CACHE_TIME = 0


async def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(ESQUEMA_SEGURIDAD),
) -> dict:
    """
    Dependencia de FastAPI que verifica el JWT de Supabase.
    Solo acepta tokens ES256 con validaciones estrictas de issuer y audience.
    """
    config = obtener_configuracion()
    token = credenciales.credentials

    try:
        header = jwt.get_unverified_header(token)
        algoritmo = header.get("alg")
        kid = header.get("kid")

        if algoritmo not in ALLOWED_ALGORITHMS:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Algoritmo '{algoritmo}' no permitido. Solo se acepta ES256.",
            )

        if algoritmo == "ES256":
            jwks = await obtener_jwks()
            llave_publica = None
            
            for key in jwks.get("keys", []):
                if key.get("kid") == kid:
                    if key["kty"] == "EC":
                        llave_publica = jwt.algorithms.ECAlgorithm.from_jwk(key)
                    elif key["kty"] == "RSA":
                        llave_publica = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                    break
            
            if not llave_publica:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No se encontró la llave pública necesaria.",
                )

            payload = jwt.decode(
                token,
                llave_publica,
                algorithms=ALLOWED_ALGORITHMS,
                audience=config.SUPABASE_URL,
                issuer=f"{config.SUPABASE_URL}",
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tipo de token no soportado.",
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
    except jwt.InvalidIssuerError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de un issuer no válido.",
        )
    except jwt.InvalidAudienceError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token con audience incorrecto.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Error de validación JWT: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token de autenticación inválido: {str(e)}",
        )
