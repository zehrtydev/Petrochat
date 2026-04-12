"""
Cliente de caché para Supabase queries frecuentes.
Implementa stale-while-revalidate pattern.
"""

import time
from typing import Any, Callable, TypeVar, Optional
from functools import wraps

T = TypeVar("T")


class QueryCache:
    def __init__(self, ttl: int = 60):
        self._cache: dict[str, tuple[Any, float]] = {}
        self._ttl = ttl

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            data, timestamp = self._cache[key]
            if time.time() - timestamp < self._ttl:
                return data
            del self._cache[key]
        return None

    def set(self, key: str, data: Any) -> None:
        self._cache[key] = (data, time.time())

    def invalidate(self, key: str) -> None:
        if key in self._cache:
            del self._cache[key]

    def invalidate_prefix(self, prefix: str) -> None:
        keys_to_delete = [k for k in self._cache if k.startswith(prefix)]
        for key in keys_to_delete:
            del self._cache[key]

    def clear(self) -> None:
        self._cache.clear()


_documentos_cache = QueryCache(ttl=60)





def invalidate_documentos_cache():
    _documentos_cache.invalidate_prefix("listar_documentos")
