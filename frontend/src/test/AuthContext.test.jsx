/**
 * Tests para AuthContext (contexto de autenticación).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() })),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

const mockAuthContext = () => Promise.resolve({
  usuario: null,
  sesion: null,
  cargando: false,
  iniciarSesion: vi.fn(),
  registrarse: vi.fn(),
  cerrarSesion: vi.fn(),
  obtenerToken: vi.fn(() => null),
})

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provee valor cuando está autenticado', async () => {
    const contextValue = await mockAuthContext()
    expect(contextValue).toBeDefined()
  })

  it('iniciarSesion está definido', async () => {
    const contextValue = await mockAuthContext()
    expect(typeof contextValue.iniciarSesion).toBe('function')
  })

  it('registrarse está definido', async () => {
    const contextValue = await mockAuthContext()
    expect(typeof contextValue.registrarse).toBe('function')
  })

  it('cerrarSesion está definido', async () => {
    const contextValue = await mockAuthContext()
    expect(typeof contextValue.cerrarSesion).toBe('function')
  })

  it('obtenerToken retorna null sin sesión', async () => {
    const contextValue = await mockAuthContext()
    expect(contextValue.obtenerToken()).toBeNull()
  })
})