"""
PetroChat — Servidor Backend
Punto de entrada principal de la API FastAPI.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import obtener_configuracion

# Importar routers
from api.routes.auth import router as router_auth
from api.routes.upload import router as router_upload
from api.routes.chat import router as router_chat
from api.routes.documents import router as router_documentos


@asynccontextmanager
async def ciclo_vida(app: FastAPI):
    """
    Evento de inicio/cierre de la aplicación.
    Se ejecuta al arrancar y al detener el servidor.
    """
    # --- Arranque ---
    print("🚀 PetroChat Backend iniciando...")
    config = obtener_configuracion()
    print(f"✅ Configuración cargada")
    print(f"📡 Frontend URL: {config.FRONTEND_URL}")
    print(f"🧠 Modelo LLM: {config.GROQ_MODELO_PRINCIPAL}")
    print(f"📐 Modelo embeddings: {config.EMBEDDING_MODEL}")
    print(f"🗄️  Índice Pinecone: {config.PINECONE_INDEX_NAME}")

    # Pre-cargar el modelo de embeddings (tarda unos segundos la primera vez)
    print("⏳ Cargando modelo de embeddings (primera vez puede tardar)...")
    from services.embeddings import obtener_modelo_embeddings
    obtener_modelo_embeddings()
    print("✅ Modelo de embeddings cargado")

    print("🟢 PetroChat Backend listo!")

    yield

    # --- Cierre ---
    print("🔴 PetroChat Backend detenido")


# Crear la aplicación FastAPI
app = FastAPI(
    title="PetroChat API",
    description="API del chatbot inteligente con RAG para análisis de documentos",
    version="1.0.0",
    lifespan=ciclo_vida,
)

# Limpiar la URL del frontend (quitar barra final si la tiene por accidente)
frontend_url = config.FRONTEND_URL.rstrip("/")

# Configurar CORS siendo amigables con vercel y localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        frontend_url,
        "https://petrochat.vercel.app",  # Fallback de seguridad
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar rutas
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
