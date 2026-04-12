"""
Utilidades centralizadas de validación y sanitización.
Unifica toda la lógica de sanitización en un solo lugar.
"""

import re
from functools import lru_cache
from typing import Callable

PROMPT_INJECTION_PATTERNS = [
    r"(?i)(ignore\s+(previous|above|prior|all)\s+(instructions?|orders?|rules?))",
    r"(?i)(disregard\s+(your|my)\s+(previous|prior)\s+(instructions?|orders?|rules?))",
    r"(?i)(new\s+instruction(s)?:)",
    r"(?i)(forget\s+(everything|all|what)\s+(you|i)\s+(know|told|said))",
    r"(?i)(system|prompt)\s*:\s*",
    r"(?i)\[system\]",
    r"(?i)<<.*>>",
    r"(?i)\(\(.*\)\)",
]

HTML_DANGEROUS_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:",
    r"on\w+\s*=",
]

MAX_LONGITUD_PREGUNTA = 2000
MAX_LONGITUD_NOMBRE_ARCHIVO = 255


def verificar_prompt_injection(texto: str) -> bool:
    """
    Verifica si el texto contiene intentos de prompt injection.
    Útil para textos de usuario que podrían intentar manipular el LLM.
    """
    if not texto:
        return False
    for patron in PROMPT_INJECTION_PATTERNS:
        if re.search(patron, texto):
            return True
    return False


def sanitizar_html_peligroso(texto: str) -> str:
    """
    Elimina patrones HTML y JavaScript peligrosos del texto.
    Útil para sanitizar inputs que se mostrarán en la UI o se enviarán al LLM.
    """
    if not texto:
        return ""
    resultado = texto
    for patron in HTML_DANGEROUS_PATTERNS:
        resultado = re.sub(patron, "", resultado, flags=re.IGNORECASE | re.DOTALL)
    return resultado.strip()


def sanitizar_pregunta(texto: str) -> str:
    """
    Sanitiza completamente una pregunta del usuario.
    1. Elimina HTML/JavaScript peligroso
    2. Trunca si es muy larga
    3. Elimina espacios al inicio/final
    """
    if not texto:
        return ""
    
    texto_limpio = sanitizar_html_peligroso(texto)
    texto_limpio = texto_limpio.strip()
    
    if len(texto_limpio) > MAX_LONGITUD_PREGUNTA:
        texto_limpio = texto_limpio[:MAX_LONGITUD_PREGUNTA]
    
    return texto_limpio


def sanitizar_respuesta_llm(texto: str) -> str:
    """
    Sanitiza respuestas del LLM antes de mostrarlas.
    Útil para prevenir XSS en la UI.
    """
    if not texto:
        return ""
    return sanitizar_html_peligroso(texto)


def es_pregunta_segura(texto: str) -> tuple[bool, str]:
    """
    Valida si una pregunta es segura para procesar.
    Retorna (es_segura, mensaje_error).
    """
    if not texto or not texto.strip():
        return False, "La pregunta no puede estar vacía."
    
    texto_sanitizado = sanitizar_pregunta(texto)
    
    if not texto_sanitizado:
        return False, "La pregunta contiene solo caracteres inválidos."
    
    if verificar_prompt_injection(texto_sanitizado):
        return False, "La pregunta no puede contener instrucciones de manipulación."
    
    return True, ""


def crear_validador(
    min_length: int = 1,
    max_length: int = 2000,
    patterns_to_check: list = None,
) -> Callable[[str], tuple[bool, str]]:
    """
    Crea un validador personalizado con configuración específica.
    
    Args:
        min_length: Longitud mínima del texto
        max_length: Longitud máxima del texto
        patterns_to_check: Patrones regex adicionales a verificar
    
    Returns:
        Función validadora que retorna (es_valido, mensaje_error)
    """
    def validador(texto: str) -> tuple[bool, str]:
        if not texto:
            return False, f"El texto no puede estar vacío (mínimo {min_length} caracteres)."
        
        if len(texto) < min_length:
            return False, f"El texto debe tener al menos {min_length} caracteres."
        
        if len(texto) > max_length:
            return False, f"El texto no puede exceder {max_length} caracteres."
        
        if patterns_to_check:
            for patron in patterns_to_check:
                if re.search(patron, texto, re.IGNORECASE):
                    return False, "El texto contiene caracteres no permitidos."
        
        return True, ""
    
    return validador



