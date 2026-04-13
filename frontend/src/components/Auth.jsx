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
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      <div className="w-full max-w-md animate-slide-up">
        
        {/* Header simple encima de la caja (Estilo Tecnifact) */}
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold font-sans tracking-tight mb-2 text-text-primary">
            <span className="text-secondary">Petro</span>Chat
          </h1>
          <p className="text-text-secondary text-[15px] font-medium">
            {esLogin ? 'Inicia sesión en tu cuenta' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        {/* Tarjeta de Formulario limpia */}
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
          <form onSubmit={manejarSubmit} className="space-y-5">
            {/* Campo email */}
            <div className="space-y-1.5">
              <label className="text-sm text-text-secondary">
                Correo electrónico
              </label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-secondary transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-3 text-[14px] text-text-primary outline-none focus:border-secondary transition-colors placeholder:text-text-secondary/50"
                />
              </div>
            </div>

            {/* Campo contraseña */}
            <div className="space-y-1.5">
              <label className="text-sm text-text-secondary">
                Contraseña
              </label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-secondary transition-colors" />
                <input
                  type={mostrarContrasena ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  minLength={6}
                  className="w-full bg-bg border border-border rounded-xl pl-10 pr-10 py-3 text-[14px] text-text-primary outline-none focus:border-secondary transition-colors placeholder:text-text-secondary/50"
                />
                <button
                  type="button"
                  onClick={() => setMostrarContrasena(!mostrarContrasena)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {mostrarContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Link Olvidaste contraseña */}
            {esLogin && (
              <div className="flex justify-end pt-1">
                <a href="#" className="text-sm text-secondary hover:text-text-primary transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            )}

            {error && (
              <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-sm text-error font-medium">
                {error}
              </div>
            )}

            {exito && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-sm text-success font-medium">
                {exito}
              </div>
            )}

            {/* Botón principal */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={cargando}
                className="w-full flex items-center justify-center gap-2 bg-secondary text-white py-3 px-4 rounded-xl font-medium text-[15px] hover:bg-secondary-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {cargando ? <Loader2 size={18} className="animate-spin" /> : null}
                <span>{esLogin ? 'Iniciar sesión' : 'Crear cuenta'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer cambiar modo */}
        <div className="mt-6 text-center">
          <p className="text-text-secondary text-sm">
            {esLogin ? '¿No tienes cuenta? ' : '¿Ya tienes una cuenta? '}
            <button
              onClick={onCambiarModo}
              className="text-secondary font-semibold hover:text-text-primary transition-colors ml-1"
            >
              {esLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
