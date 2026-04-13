import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, MessageSquare, Moon, Sun, Info } from 'lucide-react'
import Message from './Message'
import { enviarMensaje, procesarStream } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function Chat({ documentoActivo }) {
  const { obtenerToken } = useAuth()
  const { tema, toggleTema } = useTheme()
  const [mensajes, setMensajes] = useState([])
  const [inputTexto, setInputTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState(null)
  const refFinal = useRef(null)
  const refInput = useRef(null)
  const abortControllerRef = useRef(null)

  /* Auto-scroll al último mensaje */
  useEffect(() => {
    refFinal.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  /* Focus en el input al montar */
  useEffect(() => {
    refInput.current?.focus()
  }, [])

  /* Cleanup al desmontar - abortar streams activos */
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const manejarEnvio = useCallback(async (e) => {
    e.preventDefault()
    const pregunta = inputTexto.trim()
    if (!pregunta || enviando) return

    setErrorGlobal(null)
    
    // timestamp inicial
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const mensajeUsuario = {
      id: Date.now(),
      rol: 'usuario',
      texto: pregunta,
      timestamp: ts
    }

    const idBot = Date.now() + 1
    const tsBot = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const mensajeBot = {
      id: idBot,
      rol: 'bot',
      texto: '',
      escribiendo: true,
      timestamp: tsBot
    }

    setMensajes(prev => [...prev, mensajeUsuario, mensajeBot])
    setInputTexto('')
    setEnviando(true)

    try {
      const token = await obtenerToken()
      const stream = await enviarMensaje(
        pregunta,
        documentoActivo?.id || null,
        token,
      )

      await procesarStream(
        stream,
        (fragmento) => {
          setMensajes(prev =>
            prev.map(m =>
              m.id === idBot
                ? { ...m, texto: m.texto + fragmento, escribiendo: false }
                : m
            )
          )
        },
        () => {
          setMensajes(prev =>
            prev.map(m =>
              m.id === idBot ? { ...m, escribiendo: false } : m
            )
          )
          setEnviando(false)
        },
        (error) => {
          setMensajes(prev =>
            prev.map(m =>
              m.id === idBot
                ? { ...m, texto: `Error: ${error}`, escribiendo: false }
                : m
            )
          )
          setEnviando(false)
        },
      )
    } catch (error) {
      setMensajes(prev =>
        prev.map(m =>
          m.id === idBot
            ? { ...m, texto: `Error: ${error.message}`, escribiendo: false }
            : m
        )
      )
      setEnviando(false)
    }
  }, [inputTexto, enviando, documentoActivo, obtenerToken])

  return (
    <div className="flex flex-col h-full bg-bg relative">
      
      {/* Header Contextual Fijo */}
      <div className="h-16 border-b border-border bg-surface/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Info size={20} className="text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-sm font-semibold text-text-primary truncate font-['Outfit']">
              {documentoActivo ? documentoActivo.filename : 'PetroChat IA'}
            </h2>
            <p className="text-xs text-text-secondary truncate">
              {documentoActivo ? `${documentoActivo.chunk_count} fragmentos indexados` : 'Sesión general (sin contexto)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Theme */}
          <button 
            onClick={toggleTema}
            className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            title={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {tema === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-12 lg:px-24 xl:px-48 space-y-6">
        {errorGlobal && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl mb-4 text-sm flex gap-2 items-center animate-slide-up">
             <span>⚠️</span> {errorGlobal}
          </div>
        )}
        
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto animate-fade-in opacity-80">
            <div className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-6 shadow-xl shadow-secondary/20 rotate-3">
              <MessageSquare size={36} className="text-white -rotate-3" />
            </div>
            <h3 className="text-2xl font-bold mb-3 font-['Outfit'] tracking-tight text-text-primary">
              {documentoActivo
                ? `Explora "${documentoActivo.filename}"`
                : 'Bienvenido a PetroChat'}
            </h3>
            <p className="text-base text-text-secondary leading-relaxed">
              {documentoActivo
                ? 'Escribe tu pregunta abajo y el asistente extraerá la información más relevante del documento.'
                : 'Sube o selecciona un documento en el panel lateral izquierdo para comenzar a realizar consultas.'}
            </p>
          </div>
        ) : (
          <div className="pb-4">
            {mensajes.map((mensaje) => (
              <div key={mensaje.id} className="mb-6">
                <Message mensaje={mensaje} />
              </div>
            ))}
            <div ref={refFinal} className="h-4" />
          </div>
        )}
      </div>

      {/* Barra de input Glassmorphic */}
      <div className="p-4 md:px-12 lg:px-24 xl:px-48 shrink-0 bg-gradient-to-t from-bg via-bg to-transparent pb-6">
        <form onSubmit={manejarEnvio} className="relative group">
          <div className={`absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500`}></div>
          <div className="relative flex items-center gap-2 p-2 bg-surface border border-border shadow-md rounded-2xl">
            <input
              ref={refInput}
              type="text"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder={documentoActivo
                ? 'Pregunta algo sobre el documento...'
                : '¿En qué te puedo ayudar hoy?'}
              disabled={enviando}
              maxLength={2000}
              className="flex-1 bg-transparent border-none pl-4 py-3 text-[15px] outline-none text-text-primary placeholder:text-text-secondary/60 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputTexto.trim() || enviando}
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-secondary text-white disabled:opacity-40 disabled:hover:scale-100 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 shadow-sm"
            >
              {enviando
                ? <Loader2 size={20} className="animate-spin" />
                : <Send size={18} className="translate-x-[1px]" />
              }
            </button>
          </div>
        </form>
        <p className="text-center text-[11px] text-text-secondary font-medium mt-3">
          PetroChat IA puede cometer errores. Considera verificar la información importante.
        </p>
      </div>
    </div>
  )
}
