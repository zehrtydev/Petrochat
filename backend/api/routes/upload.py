"""
Rutas de subida de documentos.
Recibe archivos PDF/DOCX, los procesa y guarda en el sistema RAG.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from supabase import create_client
from core.security import obtener_usuario_actual
from core.config import obtener_configuracion
from services.rag_pipeline import procesar_documento
from models.schemas import RespuestaSubida

router = APIRouter(prefix="/api", tags=["Documentos"])

# Extensiones permitidas
EXTENSIONES_PERMITIDAS = {"pdf", "docx"}
# Tamaño máximo: 20MB
TAMANO_MAXIMO = 20 * 1024 * 1024


@router.post("/subir", response_model=RespuestaSubida)
async def subir_documento(
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

    # --- Validar archivo ---
    if not archivo.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no tiene nombre.",
        )

    extension = archivo.filename.lower().rsplit(".", 1)[-1] if "." in archivo.filename else ""
    if extension not in EXTENSIONES_PERMITIDAS:
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
        # --- Subir a Supabase Storage ---
        supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)
        ruta_storage = f"{user_id}/{archivo.filename}"

        # Determinar tipo MIME
        content_type = "application/pdf" if extension == "pdf" else \
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

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
