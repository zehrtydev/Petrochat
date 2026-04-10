"""
Rutas de gestión de documentos.
Listar y eliminar documentos del usuario.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import create_client
from core.security import obtener_usuario_actual
from core.config import obtener_configuracion
from services.rag_pipeline import eliminar_documento_rag
from models.schemas import InfoDocumento

router = APIRouter(prefix="/api", tags=["Documentos"])


@router.get("/documentos", response_model=list[InfoDocumento])
async def listar_documentos(
    usuario: dict = Depends(obtener_usuario_actual),
):
    """
    Lista todos los documentos del usuario autenticado.
    Ordenados por fecha de creación (más reciente primero).
    """
    config = obtener_configuracion()
    supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

    respuesta = (
        supabase.table("documents")
        .select("id, filename, status, chunk_count, created_at")
        .eq("user_id", usuario["user_id"])
        .order("created_at", desc=True)
        .execute()
    )

    documentos = []
    for doc in respuesta.data:
        documentos.append(
            InfoDocumento(
                id=doc["id"],
                filename=doc["filename"],
                status=doc["status"],
                chunk_count=doc["chunk_count"],
                created_at=doc["created_at"],
            )
        )

    return documentos


@router.delete("/documentos/{document_id}")
async def eliminar_documento(
    document_id: str,
    usuario: dict = Depends(obtener_usuario_actual),
):
    """
    Elimina un documento y todos sus vectores asociados.
    
    Flujo:
    1. Verifica que el documento pertenece al usuario
    2. Elimina vectores de Pinecone
    3. Elimina archivo de Supabase Storage
    4. Elimina registro de Supabase PostgreSQL
    """
    config = obtener_configuracion()
    user_id = usuario["user_id"]
    supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

    # Verificar que el documento existe y pertenece al usuario
    respuesta = (
        supabase.table("documents")
        .select("id, file_path")
        .eq("id", document_id)
        .eq("user_id", user_id)
        .execute()
    )

    if not respuesta.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado.",
        )

    documento = respuesta.data[0]

    try:
        # 1. Eliminar vectores de Pinecone
        await eliminar_documento_rag(document_id, user_id)

        # 2. Eliminar archivo de Supabase Storage
        supabase.storage.from_("documents").remove([documento["file_path"]])

        # 3. Eliminar registro de la base de datos
        supabase.table("documents").delete().eq("id", document_id).execute()

        return {"mensaje": "Documento eliminado exitosamente."}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar el documento: {str(e)}",
        )
