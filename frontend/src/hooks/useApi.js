/**
 * Hook personalizado para llamadas a la API.
 * Centraliza la lógica de fetch con autenticación y manejo de errores.
 */

import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function useApi() {
  const { obtenerToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (url, options = {}) => {
    setLoading(true)
    setError(null)

    try {
      const token = await obtenerToken()
      if (!token) {
        throw new Error('No hay sesión activa')
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      }

      if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail || `Error ${response.status}`)
      }

      if (response.headers.get('content-type')?.includes('application/json')) {
        return await response.json()
      }

      return await response.text()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [obtenerToken])

  const clearError = useCallback(() => setError(null), [])

  return { request, loading, error, clearError }
}

export function useApiGet() {
  const { request } = useApi()
  
  return useCallback((url, options = {}) => {
    return request(url, { ...options, method: 'GET' })
  }, [request])
}

export function useApiPost() {
  const { request } = useApi()
  
  return useCallback((url, body, options = {}) => {
    return request(url, {
      ...options,
      method: 'POST',
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
  }, [request])
}

export function useApiDelete() {
  const { request } = useApi()
  
  return useCallback((url, options = {}) => {
    return request(url, { ...options, method: 'DELETE' })
  }, [request])
}

export function useApiMultipart() {
  const { request } = useApi()
  
  return useCallback((url, formData, options = {}) => {
    return request(url, {
      ...options,
      method: 'POST',
      body: formData,
    })
  }, [request])
}
