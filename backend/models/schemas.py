"""
Esquemas de datos (Pydantic) para la API de PetroChat.
Define la estructura de los requests y responses.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ============================================
# Esquemas de Chat
# ============================================

class SolicitudChat(BaseModel):
    """Solicitud de chat del usuario."""
    pregunta: str = Field(..., min_length=1, description="Pregunta del usuario")
    document_id: Optional[str] = Field(
        None, description="ID del documento específico para consultar (opcional)"
    )


class RespuestaChat(BaseModel):
    """Respuesta del chatbot."""
    respuesta: str
    fuentes: list[str] = Field(
        default_factory=list, description="Fragmentos de texto usados como contexto"
    )


# ============================================
# Esquemas de Documentos
# ============================================

class RespuestaSubida(BaseModel):
    """Respuesta después de subir un documento."""
    document_id: str
    filename: str
    mensaje: str
    chunk_count: int


class InfoDocumento(BaseModel):
    """Información de un documento del usuario."""
    id: str
    filename: str
    status: str
    chunk_count: int
    created_at: str


# ============================================
# Esquemas de Autenticación
# ============================================

class InfoUsuario(BaseModel):
    """Información básica del usuario autenticado."""
    user_id: str
    email: str
