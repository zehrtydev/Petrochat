"""
Servicio de generación de embeddings.
Usa la API pública de HuggingFace para evitar cargar modelos pesados en la RAM de Render.
"""

import httpx
from typing import List, Any
from pydantic import PrivateAttr
from llama_index.core.base.embeddings.base import BaseEmbedding
from core.config import obtener_configuracion

# Variable global para reusar la instancia
_modelo_embeddings = None


class HuggingFaceAPIEmbedding(BaseEmbedding):
    """
    Implementación ultra-ligera de BaseEmbedding que redirige las 
    solicitudes matemáticas de vectores a la API pública de Hugging Face.
    """
    model_name: str = ""
    _api_key: str = PrivateAttr()

    def __init__(self, model_name: str, api_key: str, **kwargs: Any):
        super().__init__(model_name=model_name, **kwargs)
        self._api_key = api_key

    def _call_api(self, inputs: list[str]) -> list[list[float]]:
        url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{self.model_name}"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json"
        }
        payload = {"inputs": inputs}

        response = httpx.post(url, headers=headers, json=payload, timeout=60.0)
        
        if response.status_code != 200:
            raise Exception(f"Error devuelto por la API de HuggingFace: {response.text}")
            
        embeddings = response.json()
        return embeddings

    # --- Métodos obligatorios requeridos por LlamaIndex ---
    
    def _get_query_embedding(self, query: str) -> List[float]:
        result = self._call_api([query])
        # Asegurarnos de retornar la primera dimensión de la lista anidada
        if len(result) > 0 and isinstance(result[0], list):
            return result[0]
        return result

    def _get_text_embedding(self, text: str) -> List[float]:
        result = self._call_api([text])
        if len(result) > 0 and isinstance(result[0], list):
            return result[0]
        return result

    def _get_text_embeddings(self, texts: List[str]) -> List[List[float]]:
        result = self._call_api(texts)
        if len(result) > 0 and not isinstance(result[0], list):
            return [result]
        return result
        
    async def _aget_query_embedding(self, query: str) -> List[float]:
        return self._get_query_embedding(query)

    async def _aget_text_embedding(self, text: str) -> List[float]:
        return self._get_text_embedding(text)


def obtener_modelo_embeddings() -> HuggingFaceAPIEmbedding:
    """
    Retorna la instancia del modelo de embeddings basado puramente en Nube.
    """
    global _modelo_embeddings

    if _modelo_embeddings is None:
        config = obtener_configuracion()
        _modelo_embeddings = HuggingFaceAPIEmbedding(
            model_name=config.EMBEDDING_MODEL,
            api_key=config.HUGGINGFACE_API_KEY
        )

    return _modelo_embeddings


def generar_embedding(texto: str) -> list[float]:
    modelo = obtener_modelo_embeddings()
    return modelo.get_text_embedding(texto)


def generar_embeddings_batch(textos: list[str]) -> list[list[float]]:
    modelo = obtener_modelo_embeddings()
    # LlamaIndex envuelve internamente estas llamadas en get_text_embedding_batch
    return modelo.get_text_embedding_batch(textos)
