# Dockerfile para PetroChat Backend
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema requeridas para algunas librerías
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar los requirements
COPY requirements.txt .

# Instalamos 'uv', un gestor de paquetes de Rust que es 100x más rápido que pip
# Esto evita que el despliegue se quede "congelado" resolviendo dependencias
RUN pip install uv

# TRUCO PARA AHORRAR VARIOS GIGABYTES:
# Instalamos la versión exclusiva de CPU de PyTorch antes del requirements.txt
RUN uv pip install --system --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Instalar el resto de dependencias de la aplicación (uv no sufre de backtracking infinito)
RUN uv pip install --system --no-cache-dir -r requirements.txt

# Copiar todo el código de la carpeta backend
COPY . .

# Variables de entorno para asegurar que la consola muestre los Emojis y logs en tiempo real
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8

# Exponer el puerto
EXPOSE 8000

# Comando para iniciar el backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
