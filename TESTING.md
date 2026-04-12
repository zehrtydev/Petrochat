# Testing en Petrochat

## Backend - pytest

```bash
cd backend

# Instalar dependencias de test
pip install -r requirements.txt

# Ejecutar todos los tests
pytest

# Ejecutar con coverage
pytest --cov=. --cov-report=html

# Ejecutar un archivo específico
pytest tests/test_security.py

# Modo watch
pytest --watch
```

## Frontend - Vitest

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Tests con UI
npm run test:ui

# Coverage
npm run test:coverage
```

## Estructura de Tests

```
backend/
├── tests/
│   ├── conftest.py          # Fixtures compartidos
│   ├── test_security.py     # Tests de autenticación
│   ├── test_rag_pipeline.py # Tests del pipeline RAG
│   ├── test_validation.py   # Tests de validación
│   ├── test_utils.py       # Tests de utilidades
│   └── test_groq_client.py  # Tests del cliente Groq

frontend/
├── src/test/
│   ├── setup.js             # Setup de Vitest
│   ├── AuthContext.test.jsx  # Tests de autenticación
│   ├── ChatPage.test.jsx    # Tests de chat
│   ├── FileUpload.test.jsx  # Tests de upload
│   └── api.test.js          # Tests del servicio API
```

## Coverage Objetivo

- Backend: 70%+
- Frontend: 60%+
