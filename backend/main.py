"""
PetroChat — Servidor Backend
Punto de entrada principal de la API FastAPI.
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import obtener_configuracion
from core.rate_limit import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from api.routes.auth import router as router_auth
from api.routes.upload import router as router_upload
from api.routes.chat import router as router_chat
from api.routes.documents import router as router_documentos

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def ciclo_vida(app: FastAPI):
    """Evento de inicio/cierre de la aplicación."""
    logger.info("PetroChat Backend iniciando...")
    
    config = obtener_configuracion()
    logger.info(f"Configuración cargada - Frontend: {config.FRONTEND_URL}")
    logger.info(f"Modelo LLM: {config.GROQ_MODELO_PRINCIPAL}")
    
    logger.info("Precargando modelo de embeddings...")
    from services.embeddings import obtener_modelo_embeddings
    obtener_modelo_embeddings()
    logger.info("Modelo de embeddings cargado")
    
    logger.info("PetroChat Backend listo!")
    
    yield
    
    logger.info("PetroChat Backend detenido")


app = FastAPI(
    title="PetroChat API",
    description="API del chatbot inteligente con RAG para análisis de documentos",
    version="1.0.0",
    lifespan=ciclo_vida,
)

config = obtener_configuracion()
frontend_url = config.FRONTEND_URL.rstrip("/")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "https://petrochat.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router_auth)
app.include_router(router_upload)
app.include_router(router_chat)
app.include_router(router_documentos)


@app.get("/")
async def raiz():
    """Endpoint de salud para verificar que el servidor está corriendo."""
    return {
        "estado": "activo",
        "servicio": "PetroChat API",
        "version": "1.0.0",
    }
