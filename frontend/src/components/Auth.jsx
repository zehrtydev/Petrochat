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
    <div className="min-h-screen flex items-center justify-center p-4 bg-mesh-pattern relative overflow-hidden">
      {/* Background radial gradient ultra-soft */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md animate-slide-up relative z-10">
        
        {/* Componente Contenedor con Glassmorphism V2 */}
        <div className="glass-panel rounded-[24px] overflow-hidden">
          
          {/* Header */}
          <div className="px-10 pt-12 pb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent opacity-50"></div>
            
            <div className="flex items-center justify-center gap-4 mb-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-black/10 border border-border/50">
                <span className="text-3xl text-white font-['Outfit'] font-bold">P</span>
              </div>
            </div>
            <h1 className="text-[32px] font-bold font-['Outfit'] tracking-tight mb-2 text-text-primary">PetroChat</h1>
            <p className="text-text-secondary text-[15px] font-medium max-w-[280px] mx-auto">
              {esLogin ? 'Inicia sesión para continuar' : 'Crea tu cuenta gratis'}
            </p>
          </div>

          {/* Formulario */}
          <div className="px-10 pb-12">
            <form onSubmit={manejarSubmit} className="space-y-6">
              {/* Campo email */}
              <div className="space-y-2">
                <label className="text-sm font-medium block text-text-primary">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-secondary" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@empresa.com"
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              {/* Campo contraseña */}
              <div className="space-y-2">
                <label className="text-sm font-medium block text-text-primary">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-secondary" />
                  <input
                    type={mostrarContrasena ? 'text' : 'password'}
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="input-field pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 btn-ghost p-1.5 text-text-secondary hover:text-text-primary"
                    title={mostrarContrasena ? "Ocultar" : "Ver"}
                  >
                    {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Mensajes de error/éxito */}
              {error && (
                <div className="text-sm px-4 py-3 rounded-xl animate-fade-in bg-error/10 text-error flex gap-3 items-center border border-error/20">
                  <span className="flex-shrink-0 bg-error/20 rounded-full p-1"><Check size={12} className="opacity-0"/></span> {/* Trick spacing */}
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {exito && (
                <div className="text-sm px-4 py-3 rounded-xl animate-fade-in bg-success/10 text-success flex gap-3 items-center border border-success/20">
                  <span className="flex-shrink-0 bg-success/20 rounded-full p-1"><Check size={12}/></span>
                  <p className="font-medium">{exito}</p>
                </div>
              )}

              {/* Botón de submit */}
              <button type="submit" disabled={cargando}
                      className="btn-primary w-full justify-center py-3.5 text-[15px] mt-4">
                {cargando ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>{esLogin ? 'Iniciando...' : 'Creando cuenta...'}</span>
                  </>
                ) : (
                  <span>{esLogin ? 'Iniciar Sesión' : 'Continuar'}</span>
                )}
              </button>
            </form>

            {/* Enlace alternar */}
            <div className="mt-8 text-center text-[14.5px] text-text-secondary font-medium">
              {esLogin ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
              <button 
                onClick={onCambiarModo}
                className="text-text-primary hover:text-secondary hover:underline transition-colors ml-1"
              >
                {esLogin ? 'Regístrate' : 'Inicia Sesión'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer legal estético */}
        <p className="text-center text-[13px] text-text-secondary/50 mt-8 font-medium">
          &copy; {new Date().getFullYear()} PetroChat, Inc. All rights reserved.
        </p>
      </div>
    </div>
  )
}
