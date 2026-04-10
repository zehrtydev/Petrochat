/**
 * Servicio de comunicación con la API del backend.
 * Todos los requests incluyen el JWT de Supabase automáticamente.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'


/**
 * Realiza un request al backend con autenticación.
 */
async function fetchConAuth(endpoint, opciones = {}, token) {
  const headers = {
    ...opciones.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  /* Si no es FormData, agregar Content-Type JSON */
  if (!(opciones.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const respuesta = await fetch(`${API_URL}${endpoint}`, {
    ...opciones,
    headers,
  })

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}))
    throw new Error(error.detail || `Error ${respuesta.status}: ${respuesta.statusText}`)
  }

  return respuesta
}


/**
 * Sube un documento al backend para procesamiento.
 * @param {File} archivo - archivo PDF o DOCX
 * @param {string} token - JWT de Supabase
 * @returns {Promise<object>} datos del documento procesado
 */
export async function subirDocumento(archivo, token) {
  const formData = new FormData()
  formData.append('archivo', archivo)

  const respuesta = await fetchConAuth('/api/subir', {
    method: 'POST',
    body: formData,
  }, token)

  return respuesta.json()
}


/**
 * Envía un mensaje al chat y retorna un ReadableStream para streaming.
 * @param {string} pregunta - pregunta del usuario
 * @param {string|null} documentId - ID del documento (opcional)
 * @param {string} token - JWT de Supabase
 * @returns {Promise<ReadableStream>} stream de la respuesta SSE
 */
export async function enviarMensaje(pregunta, documentId, token) {
  const respuesta = await fetchConAuth('/api/chat', {
    method: 'POST',
    body: JSON.stringify({
      pregunta,
      document_id: documentId,
    }),
  }, token)

  return respuesta.body
}


/**
 * Obtiene la lista de documentos del usuario.
 * @param {string} token - JWT de Supabase
 * @returns {Promise<Array>} lista de documentos
 */
export async function obtenerDocumentos(token) {
  const respuesta = await fetchConAuth('/api/documentos', {
    method: 'GET',
  }, token)

  return respuesta.json()
}


/**
 * Elimina un documento y sus vectores asociados.
 * @param {string} documentId - ID del documento
 * @param {string} token - JWT de Supabase
 * @returns {Promise<object>} confirmación
 */
export async function eliminarDocumento(documentId, token) {
  const respuesta = await fetchConAuth(`/api/documentos/${documentId}`, {
    method: 'DELETE',
  }, token)

  return respuesta.json()
}


/**
 * Procesa un stream SSE y ejecuta un callback por cada fragmento.
 * @param {ReadableStream} stream - stream de la respuesta
 * @param {function} onFragmento - callback que recibe cada fragmento de texto
 * @param {function} onFin - callback cuando el stream termina
 * @param {function} onError - callback cuando hay un error
 */
export async function procesarStream(stream, onFragmento, onFin, onError) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onFin()
        break
      }

      buffer += decoder.decode(value, { stream: true })

      /* Procesar líneas SSE completas */
      const lineas = buffer.split('\n\n')
      buffer = lineas.pop() || ''

      for (const linea of lineas) {
        if (linea.startsWith('data: ')) {
          try {
            const datos = JSON.parse(linea.slice(6))

            if (datos.fin) {
              onFin()
              return
            }

            if (datos.error) {
              onError(datos.error)
              return
            }

            if (datos.texto) {
              onFragmento(datos.texto)
            }
          } catch {
            /* Ignorar líneas que no son JSON válido */
          }
        }
      }
    }
  } catch (error) {
    onError(error.message || 'Error al leer la respuesta')
  }
}
