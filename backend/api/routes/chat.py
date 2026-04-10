"""
Rutas de chat con RAG.
Recibe preguntas del usuario y responde usando el contexto de los documentos.
Soporta streaming (Server-Sent Events).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from core.security import obtener_usuario_actual
from services.rag_pipeline import consultar_rag
from models.schemas import SolicitudChat
import json

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat")
async def chat(
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

    if not solicitud.pregunta.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La pregunta no puede estar vacía.",
        )

    async def generar_stream():
        """Generador que envía la respuesta token por token en formato SSE."""
        try:
            async for fragmento in consultar_rag(
                pregunta=solicitud.pregunta,
                user_id=user_id,
                document_id=solicitud.document_id,
            ):
                if fragmento:
                    # Formato SSE: data: {json}\n\n
                    dato = json.dumps({"texto": fragmento}, ensure_ascii=False)
                    yield f"data: {dato}\n\n"

            # Señal de fin del stream
            yield f"data: {json.dumps({'fin': True})}\n\n"

        except Exception as e:
            error = json.dumps(
                {"error": f"Error al generar respuesta: {str(e)}"},
                ensure_ascii=False,
            )
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
