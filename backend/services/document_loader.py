"""
Servicio de carga y extracción de texto de documentos.
Soporta PDF (pdfplumber) y DOCX (python-docx).
"""

import io
import pdfplumber
from docx import Document


def extraer_texto_pdf(contenido_bytes: bytes) -> str:
    """
    Extrae todo el texto de un archivo PDF.
    
    Args:
        contenido_bytes: contenido del archivo PDF en bytes
    
    Returns:
        Texto completo extraído de todas las páginas
    """
    texto_completo = []

    with pdfplumber.open(io.BytesIO(contenido_bytes)) as pdf:
        for pagina in pdf.pages:
            texto_pagina = pagina.extract_text()
            if texto_pagina:
                texto_completo.append(texto_pagina)

    return "\n\n".join(texto_completo)


def extraer_texto_docx(contenido_bytes: bytes) -> str:
    """
    Extrae todo el texto de un archivo DOCX.
    
    Args:
        contenido_bytes: contenido del archivo DOCX en bytes
    
    Returns:
        Texto completo extraído de todos los párrafos
    """
    documento = Document(io.BytesIO(contenido_bytes))
    parrafos = [parrafo.text for parrafo in documento.paragraphs if parrafo.text.strip()]
    return "\n\n".join(parrafos)


def extraer_texto(contenido_bytes: bytes, nombre_archivo: str) -> str:
    """
    Detecta el tipo de archivo y extrae el texto automáticamente.
    
    Args:
        contenido_bytes: contenido del archivo en bytes
        nombre_archivo: nombre del archivo con extensión
    
    Returns:
        Texto extraído del documento
    
    Raises:
        ValueError: si el formato del archivo no está soportado
    """
    extension = nombre_archivo.lower().rsplit(".", 1)[-1] if "." in nombre_archivo else ""

    if extension == "pdf":
        return extraer_texto_pdf(contenido_bytes)
    elif extension in ("docx", "doc"):
        return extraer_texto_docx(contenido_bytes)
    else:
        raise ValueError(
            f"Formato de archivo no soportado: .{extension}. "
            "Solo se aceptan archivos PDF y DOCX."
        )
