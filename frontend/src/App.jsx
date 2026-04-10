/**
 * Componente raíz de PetroChat.
 * Configura las rutas y la protección de páginas autenticadas.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChatPage from './pages/ChatPage'

/**
 * Componente que protege rutas que requieren autenticación.
 * Redirige al login si el usuario no está autenticado.
 */
function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ backgroundColor: 'var(--color-bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Cargando PetroChat...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace />
  }

  return children
}

/**
 * Componente que redirige usuarios autenticados fuera del login/registro.
 */
function RutaPublica({ children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return null

  if (usuario) {
    return <Navigate to="/chat" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas (login / registro) */}
      <Route path="/login" element={
        <RutaPublica>
          <LoginPage />
        </RutaPublica>
      } />
      <Route path="/registro" element={
        <RutaPublica>
          <SignupPage />
        </RutaPublica>
      } />

      {/* Ruta protegida (chat) */}
      <Route path="/chat" element={
        <RutaProtegida>
          <ChatPage />
        </RutaProtegida>
      } />

      {/* Redirigir raíz al chat */}
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
