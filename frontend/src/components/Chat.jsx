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

  useEffect(() => {
    refFinal.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  useEffect(() => {
    refInput.current?.focus()
  }, [])

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
      
      {/* Header Translúcido Superior */}
      <div className="h-[60px] border-b border-border bg-bg/80 backdrop-blur-xl px-8 flex items-center justify-between z-10 absolute top-0 w-full left-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex flex-col min-w-0">
            <h2 className="text-[14px] font-semibold text-text-primary truncate flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              {documentoActivo ? documentoActivo.filename : 'Generación IA General'}
            </h2>
            {documentoActivo && (
              <p className="text-[11px] text-text-secondary truncate mt-0.5 font-medium ml-4">
                {documentoActivo.chunk_count} fragmentos cargados en la memoria local
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Theme - Estilo Premium Pill */}
          <button 
            onClick={toggleTema}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-text-secondary hover:text-text-primary hover:border-text-secondary/30 transition-all shadow-sm"
            title={tema === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {tema === 'dark' ? <Sun size={14} className="text-secondary" /> : <Moon size={14} />}
            <span className="text-[11px] font-medium hidden sm:block">{tema === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </div>

      {/* Área de mensajes con un gran margen superior e inferior */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-12 md:px-24 lg:px-48 xl:px-64 pt-24 pb-48 space-y-8 scroll-smooth">
        {errorGlobal && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm flex gap-2 items-center mx-auto max-w-3xl">
             <span className="text-lg">⚠️</span> 
             <span className="font-medium">{errorGlobal}</span>
          </div>
        )}
        
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto opacity-80 mt-10">
            <div className="w-24 h-24 rounded-[32px] bg-surface border border-border flex items-center justify-center mb-8 shadow-2xl relative">
              <div className="absolute inset-0 bg-secondary/10 blur-xl rounded-[32px] -z-10"></div>
              <MessageSquare size={40} className="text-text-primary" />
            </div>
            <h3 className="text-[28px] font-bold mb-4 font-['Outfit'] tracking-tight text-text-primary">
              ¿En qué te puedo ayudar?
            </h3>
            <p className="text-[15px] text-text-secondary leading-relaxed font-medium px-4">
              {documentoActivo
                ? 'Escribe tu pregunta abajo y el sistema extraerá las respuestas más prontas del documento seleccionado.'
                : 'Sube o selecciona un documento en el panel lateral para arrancar una sesión de análisis profundo.'}
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full">
            {mensajes.map((mensaje) => (
              <div key={mensaje.id} className="mb-8">
                <Message mensaje={mensaje} />
              </div>
            ))}
            <div ref={refFinal} className="h-4" />
          </div>
        )}
      </div>

      {/* Barra de input Ominprésente (Flotante) */}
      <div className="absolute bottom-0 left-0 w-full px-4 sm:px-12 md:px-24 lg:px-48 xl:px-64 pb-8 bg-gradient-to-t from-bg via-bg/90 to-transparent pointer-events-none">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">
          <form onSubmit={manejarEnvio} className="relative group">
            {/* Anillo exterior blur premium */}
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary-dark/20 to-secondary-light/20 blur opacity-0 group-focus-within:opacity-100 transition duration-1000 -z-10 rounded-3xl"></div>
            
            <div className="relative flex items-center gap-2 p-2 bg-surface border border-border shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-[20px]">
              <input
                ref={refInput}
                type="text"
                value={inputTexto}
                onChange={(e) => setInputTexto(e.target.value)}
                placeholder={documentoActivo
                  ? 'Pregunta algo al documento...'
                  : 'Empieza a escribir...'}
                disabled={enviando}
                maxLength={2000}
                className="flex-1 bg-transparent border-none pl-5 py-4 text-[15px] outline-none text-text-primary placeholder:text-text-secondary/60 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputTexto.trim() || enviando}
                className={`w-12 h-12 flex items-center justify-center rounded-[14px] shrink-0 transition-all ${
                  !inputTexto.trim() || enviando 
                    ? 'bg-bg text-text-secondary/50' 
                    : 'bg-secondary text-white shadow-[0_2px_10px_rgba(245,158,11,0.2)] hover:scale-[1.02] hover:bg-secondary-dark'
                }`}
              >
                {enviando
                  ? <Loader2 size={20} className="animate-spin text-text-secondary" />
                  : <Send size={18} className={`${inputTexto.trim() ? 'translate-x-[2px]' : ''}`} />
                }
              </button>
            </div>
          </form>
          <p className="text-center text-[11px] text-text-secondary font-medium mt-3">
            Las alertas automáticas pueden cometer errores. Verifica fuentes sensibles.
          </p>
        </div>
      </div>
    </div>
  )
}
