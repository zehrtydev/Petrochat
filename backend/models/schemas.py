"""
Esquemas de datos (Pydantic) para la API de PetroChat.
Define la estructura de los requests y responses.
"""

from pydantic import BaseModel, Field


class SolicitudChat(BaseModel):
    pregunta: str = Field(..., min_length=1, max_length=2000, description="Pregunta del usuario")
    document_id: str | None = Field(None, description="ID del documento específico para consultar (opcional)")


class RespuestaChat(BaseModel):
    respuesta: str
    fuentes: list[str] = Field(default_factory=list, description="Fragmentos de texto usados como contexto")


class RespuestaSubida(BaseModel):
    document_id: str
    filename: str
    mensaje: str
    chunk_count: int


class InfoDocumento(BaseModel):
    id: str
    filename: str
    status: str
    chunk_count: int
    created_at: str


class InfoUsuario(BaseModel):
    user_id: str
    email: str
