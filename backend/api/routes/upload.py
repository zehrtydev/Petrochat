"""
Rutas de subida de documentos.
Recibe archivos PDF/DOCX, los procesa y guarda en el sistema RAG.
"""

import os
import re
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Request
from core.security import obtener_usuario_actual
from core.config import obtener_configuracion
from core.service_registry import ServiceRegistry
from core.rate_limit import limiter
from services.rag_pipeline import procesar_documento
from models.schemas import RespuestaSubida
from utils.files import obtener_extension, validar_extension_archivo


def sanitizar_nombre_archivo(filename: str, extension: str) -> str:
    base = os.path.basename(filename)
    base = re.sub(r'[^\w\s.-]', '', base)
    base = base.strip('. ')
    if not base:
        base = f"document_{uuid.uuid4().hex[:8]}"
    else:
        ext_actual = obtener_extension(base)
        if ext_actual == extension:
            return base
    return f"{base}.{extension}"

router = APIRouter(prefix="/api", tags=["Documentos"])

TAMANO_MAXIMO = 20 * 1024 * 1024

MIME_TYPES = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@router.post("/subir", response_model=RespuestaSubida)
@limiter.limit("5/minute")
async def subir_documento(
    request: Request,
    archivo: UploadFile = File(...),
    usuario: dict = Depends(obtener_usuario_actual),
):
    """
    Sube un documento y lo procesa para el sistema RAG.
    
    Flujo:
    1. Valida el archivo (tipo y tamaño)
    2. Sube a Supabase Storage
    3. Extrae texto, genera chunks y embeddings
    4. Guarda vectores en Pinecone
    5. Guarda metadata en Supabase PostgreSQL
    """
    config = obtener_configuracion()
    user_id = usuario["user_id"]

    if not archivo.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no tiene nombre.",
        )

    extension = obtener_extension(archivo.filename)
    if not validar_extension_archivo(archivo.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Formato no soportado: .{extension}. Solo se aceptan PDF y DOCX.",
        )

    # Leer contenido del archivo
    contenido = await archivo.read()

    if len(contenido) > TAMANO_MAXIMO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo supera el tamaño máximo de 20MB.",
        )

    if len(contenido) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo está vacío.",
        )

    try:
        nombre_seguro = sanitizar_nombre_archivo(archivo.filename, extension)
        
        supabase = ServiceRegistry.get_supabase_client()
        ruta_storage = f"{user_id}/{nombre_seguro}"

        # Determinar tipo MIME
        content_type = MIME_TYPES.get(extension, "application/octet-stream")

        supabase.storage.from_("documents").upload(
            path=ruta_storage,
            file=contenido,
            file_options={"content-type": content_type, "upsert": "true"},
        )

        # --- Procesar documento (extraer, chunking, embeddings, Pinecone) ---
        resultado = await procesar_documento(contenido, archivo.filename, user_id)

        # --- Guardar metadata en Supabase PostgreSQL ---
        supabase.table("documents").insert({
            "id": resultado["document_id"],
            "user_id": user_id,
            "filename": archivo.filename,
            "file_path": ruta_storage,
            "status": "listo",
            "chunk_count": resultado["chunk_count"],
        }).execute()

        return RespuestaSubida(
            document_id=resultado["document_id"],
            filename=archivo.filename,
            mensaje=f"Documento procesado exitosamente. Se generaron {resultado['chunk_count']} fragmentos.",
            chunk_count=resultado["chunk_count"],
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar el documento: {str(e)}",
        )
