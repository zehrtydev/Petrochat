"""
Cliente de Groq para generación de texto con LLM.
Modelo principal: Llama-3.3-70B. Fallback: Llama-3.1-8B.
"""

import logging
from typing import AsyncGenerator
from core.service_registry import ServiceRegistry

logger = logging.getLogger(__name__)


async def generar_respuesta_stream(prompt: str) -> AsyncGenerator[str, None]:
    try:
        llm = ServiceRegistry.get_llm_principal()
        respuesta_stream = await llm.astream_complete(prompt)

        async for fragmento in respuesta_stream:
            if fragmento.delta:
                yield fragmento.delta

    except Exception as error_principal:
        logger.warning(f"Error con modelo principal, usando fallback: {error_principal}")

        try:
            llm_respaldo = ServiceRegistry.get_llm_fallback()
            respuesta_stream = await llm_respaldo.astream_complete(prompt)

            async for fragmento in respuesta_stream:
                if fragmento.delta:
                    yield fragmento.delta

        except Exception as error_fallback:
            logger.error(f"Error en fallback también: {error_fallback}")
            raise RuntimeError(f"Error al generar respuesta: {error_fallback}") from error_fallback
