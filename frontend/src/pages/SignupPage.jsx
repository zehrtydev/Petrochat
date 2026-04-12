/**
 * Página de registro de usuario.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Auth from '../components/Auth'

export default function SignupPage() {
  const { registrarse } = useAuth()
  const navigate = useNavigate()

  async function manejarRegistro(email, contrasena) {
    await registrarse(email, contrasena)
  }

  return (
    <Auth
      modo="registro"
      onSubmit={manejarRegistro}
      onCambiarModo={() => navigate('/login')}
    />
  )
}
