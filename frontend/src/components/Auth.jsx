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
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh-pattern">
      <div className="w-full max-w-md animate-slide-up">
        {/* Componente Contenedor con Glassmorphism */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
          
          {/* Header */}
          <div className="p-8 text-center border-b border-border/50 relative overflow-hidden">
            {/* Decal Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-secondary/10 blur-[40px] -z-10 rounded-full" />
            
            <div className="flex items-center justify-center gap-3 mb-2 relative z-10">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-secondary/20">
                <span className="text-2xl text-white font-['Outfit'] font-bold">P</span>
              </div>
              <h1 className="text-3xl font-bold font-['Outfit'] tracking-tight">PetroChat</h1>
            </div>
            <p className="text-text-secondary text-sm relative z-10">
              {esLogin ? 'Ingresa para continuar interactuando' : 'Empieza tu análisis documental inteligente'}
            </p>
          </div>

          {/* Formulario */}
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6 font-['Outfit']">
              {esLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>

            <form onSubmit={manejarSubmit} className="space-y-5">
              {/* Campo email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium block text-text-primary">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-secondary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    required
                    className="input-field pl-10 bg-surface/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Campo contraseña */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium block text-text-primary">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-secondary" />
                  <input
                    type={mostrarContrasena ? 'text' : 'password'}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="input-field pl-10 pr-10 bg-surface/50 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-ghost p-1.5 text-text-secondary hover:text-text-primary"
                    title={mostrarContrasena ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Mensajes de error/éxito */}
              {error && (
                <div className="text-sm px-4 py-3 rounded-xl animate-fade-in bg-error/10 text-error border border-error/20 flex gap-2 items-center">
                  <span className="flex-shrink-0">⚠️</span>
                  <p>{error}</p>
                </div>
              )}

              {exito && (
                <div className="text-sm px-4 py-3 rounded-xl animate-fade-in bg-success/10 text-success border border-success/20 flex gap-2 items-center">
                  <span className="flex-shrink-0">✅</span>
                  <p>{exito}</p>
                </div>
              )}

              {/* Botón de submit */}
              <button type="submit" disabled={cargando}
                      className="btn-primary w-full justify-center py-3 text-base mt-2">
                {cargando ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{esLogin ? 'Iniciando sesión...' : 'Registrando...'}</span>
                  </>
                ) : (
                  <span>{esLogin ? 'Ingresar a mi cuenta' : 'Comenzar ahora'}</span>
                )}
              </button>
            </form>

            {/* Enlace alternar */}
            <div className="mt-8 text-center text-sm text-text-secondary">
              {esLogin ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
              <button onClick={onCambiarModo}
                      className="font-medium text-secondary hover:text-secondary-dark hover:underline transition-colors">
                {esLogin ? 'Regístrate aquí' : 'Iniciá sesión'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer legal estético */}
        <p className="text-center text-xs text-text-secondary/60 mt-6 font-medium">
          &copy; {new Date().getFullYear()} PetroChat AI. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}
