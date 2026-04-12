"""
Servicio de almacenamiento vectorial con Pinecone.
Gestiona la conexión, inserción, consulta y eliminación de vectores.
"""

from typing import Any
from core.service_registry import ServiceRegistry

TAMANO_BATCH = 500


def obtener_indice() -> Any:
    return ServiceRegistry.get_pinecone_index()


def guardar_vectores(vectores: list[dict[str, Any]]) -> int:
    indice = obtener_indice()
    total_guardados = 0

    for i in range(0, len(vectores), TAMANO_BATCH):
        batch = vectores[i : i + TAMANO_BATCH]
        indice.upsert(vectors=batch)
        total_guardados += len(batch)

    return total_guardados


def consultar_vectores(
    embedding_consulta: list[float],
    user_id: str,
    top_k: int = 5,
    document_id: str | None = None,
) -> list[dict[str, Any]]:
    indice = obtener_indice()

    filtro = {"user_id": {"$eq": user_id}}
    if document_id:
        filtro["document_id"] = {"$eq": document_id}

    resultados = indice.query(
        vector=embedding_consulta,
        top_k=top_k,
        include_metadata=True,
        filter=filtro,
        timeout=30.0,
    )

    fragmentos = []
    for match in resultados.get("matches", []):
        fragmentos.append({
            "texto": match["metadata"].get("texto", ""),
            "score": match["score"],
            "document_id": match["metadata"].get("document_id", ""),
            "filename": match["metadata"].get("filename", ""),
        })

    return fragmentos


def eliminar_vectores(document_id: str, user_id: str) -> None:
    indice = obtener_indice()
    indice.delete(
        filter={
            "user_id": {"$eq": user_id},
            "document_id": {"$eq": document_id},
        }
    )
