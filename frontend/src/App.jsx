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
        {/* Abstract Ambient Lights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[300px] h-[300px] bg-secondary/15 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col items-center gap-8 z-10 animate-fade-in">
          <div className="relative">
            {/* Glow backing */}
            <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full"></div>
            
            <div className="relative w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-secondary/10 border border-border/50">
               <span className="text-3xl text-white font-['Outfit'] font-bold">P</span>
            </div>
            
            {/* Micro badge indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-surface flex items-center justify-center shadow-sm">
               <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <p className="text-[13px] font-medium text-text-secondary tracking-widest uppercase">
              Inicializando Motor
            </p>
            {/* Linear Progress bar */}
            <div className="w-32 h-1 bg-surface border border-border rounded-full overflow-hidden">
               <div className="h-full bg-secondary bg-gradient-to-r from-secondary-dark to-secondary w-full animate-[slideInLeft_1s_ease-in-out_infinite_alternate]"></div>
            </div>
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
