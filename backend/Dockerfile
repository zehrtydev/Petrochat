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

# Instalar el resto de dependencias de la aplicación (uv no sufre de backtracking infinito)
RUN uv pip install --system --no-cache-dir -r requirements.txt

# Copiar todo el código de la carpeta backend
COPY . .

# Variables de entorno para asegurar que la consola muestre los Emojis y logs en tiempo real
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8

# Exponer el puerto
EXPOSE 8000

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
