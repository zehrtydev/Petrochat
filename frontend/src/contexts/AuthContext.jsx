/**
 * Contexto de autenticación de PetroChat.
 * Gestiona el estado de sesión del usuario con Supabase Auth.
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [sesion, setSesion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    /* Recuperar sesión existente al cargar la app */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSesion(session)
      setUsuario(session?.user ?? null)
      setCargando(false)
    })

    /* Escuchar cambios en la autenticación */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        setSesion(session)
        setUsuario(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /**
   * Iniciar sesión con email y contraseña.
   */
  async function iniciarSesion(email, contrasena) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: contrasena,
    })

    if (error) throw error
    return data
  }

  /**
   * Registrar un nuevo usuario.
   */
  async function registrarse(email, contrasena) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: contrasena,
    })

    if (error) throw error
    return data
  }

  /**
   * Cerrar sesión.
   */
  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  /**
   * Obtener el token JWT actual.
   */
  function obtenerToken() {
    return sesion?.access_token || null
  }

  const valor = {
    usuario,
    sesion,
    cargando,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    obtenerToken,
  }

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook para usar el contexto de autenticación.
 */
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return contexto
}
