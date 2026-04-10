/**
 * Componente de formulario de autenticación reutilizable.
 * Se usa tanto para login como para registro.
 */

import { useState } from 'react'
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Auth({ modo, onSubmit, onCambiarModo }) {
  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const esLogin = modo === 'login'

  async function manejarSubmit(e) {
    e.preventDefault()
    setError('')
    setExito('')
    setCargando(true)

    try {
      await onSubmit(email, contrasena)
      if (!esLogin) {
        setExito('¡Registro exitoso! Revisá tu correo para confirmar la cuenta.')
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error. Intentá de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        {/* Header con gradiente */}
        <div className="gradient-primary rounded-t-2xl px-8 py-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <span className="text-2xl">🤖</span>
            </div>
            <h1 className="text-2xl font-bold text-white">PetroChat</h1>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Chatbot inteligente para análisis de documentos
          </p>
        </div>

        {/* Formulario */}
        <div className="rounded-b-2xl p-8 shadow-lg"
             style={{ backgroundColor: 'var(--color-surface)' }}>
          <h2 className="text-xl font-semibold mb-6"
              style={{ color: 'var(--color-text-primary)' }}>
            {esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>

          <form onSubmit={manejarSubmit} className="space-y-4">
            {/* Campo email */}
            <div>
              <label className="text-sm font-medium mb-1.5 block"
                     style={{ color: 'var(--color-text-secondary)' }}>
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Campo contraseña */}
            <div>
              <label className="text-sm font-medium mb-1.5 block"
                     style={{ color: 'var(--color-text-secondary)' }}>
                Contraseña
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--color-text-secondary)' }} />
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-1"
                >
                  {mostrarContrasena
                    ? <EyeOff size={18} style={{ color: 'var(--color-text-secondary)' }} />
                    : <Eye size={18} style={{ color: 'var(--color-text-secondary)' }} />
                  }
                </button>
              </div>
            </div>

            {/* Mensajes de error/éxito */}
            {error && (
              <div className="text-sm px-3 py-2 rounded-lg animate-fade-in"
                   style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-error)' }}>
                {error}
              </div>
            )}

            {exito && (
              <div className="text-sm px-3 py-2 rounded-lg animate-fade-in"
                   style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--color-success)' }}>
                {exito}
              </div>
            )}

            {/* Botón de submit */}
            <button type="submit" disabled={cargando}
                    className="btn-primary w-full justify-center py-3 text-base">
              {cargando ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {esLogin ? 'Iniciando sesión...' : 'Registrando...'}
                </>
              ) : (
                esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
              )}
            </button>
          </form>

          {/* Enlace para cambiar entre login y registro */}
          <div className="mt-6 text-center text-sm"
               style={{ color: 'var(--color-text-secondary)' }}>
            {esLogin ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
            <button onClick={onCambiarModo}
                    className="font-semibold hover:underline"
                    style={{ color: 'var(--color-secondary)' }}>
              {esLogin ? 'Registrate' : 'Iniciá sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
