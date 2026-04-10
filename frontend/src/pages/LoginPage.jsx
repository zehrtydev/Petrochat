/**
 * Página de inicio de sesión.
 */

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Auth from '../components/Auth'

export default function LoginPage() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()

  async function manejarLogin(email, contrasena) {
    await iniciarSesion(email, contrasena)
    navigate('/chat')
  }

  return (
    <Auth
      modo="login"
      onSubmit={manejarLogin}
      onCambiarModo={() => navigate('/registro')}
    />
  )
}
