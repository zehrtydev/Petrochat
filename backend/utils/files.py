"""
Utilidades para manejo de archivos.
"""

from utils.validacion import sanitizar_pregunta

EXTENSIONES_PERMITIDAS = {"pdf", "docx"}


def obtener_extension(nombre_archivo: str) -> str:
    """
    Extrae la extensión de un nombre de archivo.
    """
    if not nombre_archivo or "." not in nombre_archivo:
        return ""
    return nombre_archivo.lower().rsplit(".", 1)[-1]


def validar_extension_archivo(nombre_archivo: str) -> bool:
    """
    Verifica si la extensión del archivo es permitida (pdf o docx).
    """
    extension = obtener_extension(nombre_archivo)
    return extension in EXTENSIONES_PERMITIDAS
