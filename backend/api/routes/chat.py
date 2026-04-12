"""
Rutas de chat con RAG.
Recibe preguntas del usuario y responde usando el contexto de los documentos.
Soporta streaming (Server-Sent Events).
"""

import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from core.security import obtener_usuario_actual
from core.rate_limit import limiter
from services.rag_pipeline import consultar_rag
from models.schemas import SolicitudChat
from utils.validacion import sanitizar_pregunta

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat")
@limiter.limit("20/minute")
async def chat(
    request: Request,
    solicitud: SolicitudChat,
    usuario: dict = Depends(obtener_usuario_actual),
):
    """
    Endpoint de chat con streaming (Server-Sent Events).
    
    Flujo:
    1. Recibe la pregunta del usuario
    2. Busca contexto relevante en Pinecone
    3. Genera respuesta con Groq (streaming token por token)
    4. Envía la respuesta fragmento a fragmento via SSE
    """
    user_id = usuario["user_id"]

    pregunta_limpia = sanitizar_pregunta(solicitud.pregunta)
    if not pregunta_limpia:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La pregunta no puede estar vacía.",
        )

    async def generar_stream():
        """Generador que envía la respuesta token por token en formato SSE."""
        try:
            async for fragmento in consultar_rag(
                pregunta=pregunta_limpia,
                user_id=user_id,
                document_id=solicitud.document_id,
            ):
                if fragmento:
                    dato = json.dumps({"texto": fragmento}, ensure_ascii=False)
                    yield f"data: {dato}\n\n"

            yield f"data: {json.dumps({'fin': True})}\n\n"

        except RuntimeError as e:
            logger.error(f"Error de generación RAG: {e}")
            error = json.dumps({"error": str(e)}, ensure_ascii=False)
            yield f"data: {error}\n\n"
        except Exception as e:
            logger.exception("Error inesperado en chat stream")
            error = json.dumps({"error": "Error interno del servidor"}, ensure_ascii=False)
            yield f"data: {error}\n\n"

    return StreamingResponse(
        generar_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
