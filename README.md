# PetroChat — Asistente Inteligente de Documentos (RAG)

PetroChat es una aplicación full-stack que permite a los usuarios subir documentos (PDF/DOCX) y hacerles preguntas utilizando Inteligencia Artificial. Utiliza una arquitectura RAG (Generación Aumentada por Recuperación) para buscar en el texto de los documentos y generar respuestas precisas.

## 🧱 Stack Tecnológico

### Frontend
- **React 19** + **Vite**
- **TailwindCSS v4** (Integración moderna vía plugin)
- **Supabase JS** (Autenticación y Storage)
- **React Router** & **React Dropzone**

### Backend
- **Python 3.11+** + **FastAPI**
- **LlamaIndex** (Orquestador principal RAG)
- **Groq API** (Llama-3.3-70B y Llama-3.1-8B)
- **Pinecone** (Base de datos vectorial)
- **Supabase-py** (PostgreSQL y Storage)
- **BGE-Small-EN-v1.5** (Modelo local gratuito para Embeddings)

---

## 🚀 Guía de Instalación

### 1. Requisitos Previos

Antes de arrancar, necesitás:
- Python 3.11 o superior.
- Node.js v18 o superior.
- Cuentas activas en: **Groq**, **Pinecone** y **Supabase**.

### 2. Configuración de Supabase

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ve a **Storage** y crea un bucket llamado `documents`.
3. Ve a **SQL Editor** y ejecuta el siguiente script para crear la base de datos y sus políticas de seguridad:

```sql
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT DEFAULT 'processing',
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Configurar seguridad (Row Level Security)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios pueden ver sus documentos" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden insertar documentos" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuarios pueden eliminar documentos" ON documents FOR DELETE USING (auth.uid() = user_id);
```

### 3. Configuración de Pinecone

1. Crea una cuenta en [Pinecone](https://pinecone.io).
2. Crea un índice con los siguientes datos exactos:
   - **Name:** `petrochat`
   - **Dimensions:** `384` *(Importante: debe coincidir con BGE-Small)*
   - **Metric:** `cosine`

### 4. Setup del Backend

Abre una terminal en la carpeta principal `Petrochat/`:

```bash
# 1. Copiar el archivo de variables y completarlo
cp .env.example .env

# (Editar .env y agregar las contraseñas de Groq, Pinecone y Supabase)

# 2. Ir a la carpeta del backend y crear entorno virtual
cd backend
python -m venv venv
venv\Scripts\activate  # En Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Arrancar el servidor
uvicorn main:app --reload
# El backend iniciará en: http://localhost:8000
```
*(Nota: la primera vez que levantes el servidor va a demorar un poco descargando el modelo local de embeddings de HuggingFace).*

### 5. Setup del Frontend

Abre otra terminal y dirígete a `Petrochat/frontend`:

```bash
# 1. Copiar archivo de variables y completarlo
cp .env.example .env.local

# (Editar .env.local y poner las URL/Keys de Supabase)

# 2. Instalar dependencias
npm install

# 3. Levantar entorno de desarrollo
npm run dev
# Vite iniciará en: http://localhost:5173
```

---

## 🧠 Solución de Problemas

- **Error CORS al subir un archivo:** Verifica que la variable `FRONTEND_URL` en el backend `.env` coincida exactamente con la URL de Vite (usualmente `http://localhost:5173`).
- **El chat no responde nada:** Asegúrate de tener saldo/créditos en tu cuenta de Groq API y de que `GROQ_API_KEY` es válida.
- **Error 500 al guardar en Pinecone:** Confirma que creaste el índice con exactamente **384 dimensiones**.

## ✨ Arquitectura de Embeddings

En lugar de requerir una API Key de pago en OpenAI para los embeddings, este proyecto utiliza `BAAI/bge-small-en-v1.5` de forma local y gratuita gracias a LlamaIndex. Provee excelente calidad y mantiene los costos al mínimo.
