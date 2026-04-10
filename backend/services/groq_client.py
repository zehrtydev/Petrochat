"""
Cliente de Groq para generación de texto con LLM.
Modelo principal: Llama 3 70B. Fallback: Mixtral 8x7B.
"""

from llama_index.llms.groq import Groq
from core.config import obtener_configuracion

# Instancia global del LLM
_llm_principal = None
_llm_fallback = None


def obtener_llm_principal() -> Groq:
    """
    Retorna la instancia del LLM principal (Llama 3 70B).
    Se inicializa una sola vez y se reutiliza.
    """
    global _llm_principal

    if _llm_principal is None:
        config = obtener_configuracion()
        _llm_principal = Groq(
            model=config.GROQ_MODELO_PRINCIPAL,
            api_key=config.GROQ_API_KEY,
        )

    return _llm_principal


def obtener_llm_fallback() -> Groq:
    """
    Retorna la instancia del LLM de respaldo (Mixtral 8x7B).
    Se usa cuando el modelo principal falla.
    """
    global _llm_fallback

    if _llm_fallback is None:
        config = obtener_configuracion()
        _llm_fallback = Groq(
            model=config.GROQ_MODELO_FALLBACK,
            api_key=config.GROQ_API_KEY,
        )

    return _llm_fallback


async def generar_respuesta_stream(prompt: str):
    """
    Genera una respuesta usando Groq con streaming.
    Si el modelo principal falla, usa el modelo de respaldo.
    
    Args:
        prompt: prompt completo con contexto y pregunta
    
    Yields:
        Fragmentos de texto de la respuesta (token por token)
    """
    try:
        llm = obtener_llm_principal()
        respuesta_stream = await llm.astream_complete(prompt)

        async for fragmento in respuesta_stream:
            yield fragmento.delta

    except Exception as error_principal:
        print(f"Error con modelo principal, usando fallback: {error_principal}")

        try:
            llm_respaldo = obtener_llm_fallback()
            respuesta_stream = await llm_respaldo.astream_complete(prompt)

            async for fragmento in respuesta_stream:
                yield fragmento.delta

        except Exception as error_fallback:
            yield f"Error al generar respuesta: {error_fallback}"


async def generar_respuesta(prompt: str) -> str:
    """
    Genera una respuesta completa (sin streaming).
    Se usa como respaldo si el streaming falla.
    
    Args:
        prompt: prompt completo con contexto y pregunta
    
    Returns:
        Texto completo de la respuesta
    """
    try:
        llm = obtener_llm_principal()
        respuesta = await llm.acomplete(prompt)
        return str(respuesta)

    except Exception:
        llm_respaldo = obtener_llm_fallback()
        respuesta = await llm_respaldo.acomplete(prompt)
        return str(respuesta)
