/**
 * Componente raíz de PetroChat.
 * Configura las rutas y la protección de páginas autenticadas.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
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
      <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden">
        {/* Background blobs decorativos */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full"></div>
        <div className="flex flex-col items-center gap-5 z-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-2xl shadow-secondary/20">
             <span className="text-3xl text-white font-['Outfit'] font-bold">P</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '0s' }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-sm font-medium text-text-secondary mt-2">
              Iniciando PetroChat...
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
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
