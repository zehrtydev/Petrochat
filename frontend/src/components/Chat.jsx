import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, MessageSquare, Moon, Sun, Sparkles, Zap } from 'lucide-react'
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
    <div className="flex flex-col h-full bg-bg relative w-full overflow-hidden">
      
      {/* Header Premium - Glassmorphism Style */}
      <header className="absolute top-0 w-full z-20 px-4 pt-4 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="flex items-center justify-between backdrop-blur-xl bg-surface/70 border border-border/50 rounded-2xl px-4 py-3 shadow-lg shadow-black/5">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-md">
                <Zap size={18} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[15px] text-text-primary tracking-tight">
                  PetroChat
                </span>
                <span className="text-[11px] text-text-secondary/70 font-medium">
                  AI Assistant v2.0
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              <span className="text-[12px] font-medium text-success">Online</span>
            </div>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTema}
              className="p-2.5 rounded-xl border border-border/50 bg-bg/50 text-text-secondary hover:text-text-primary hover:bg-bg transition-all duration-200 cursor-pointer"
            >
              {tema === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto w-full scroll-smooth pt-20">
        <div className="max-w-3xl mx-auto w-full px-4 lg:px-8 pb-44 min-h-full flex flex-col">
          
          {errorGlobal && (
            <div className="mb-6 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-[14px] flex gap-3 items-center animate-fade-in">
               <span className="w-6 h-6 rounded-lg bg-error/20 flex items-center justify-center">
                 <Zap size={14} />
               </span> 
               <span>{errorGlobal}</span>
            </div>
          )}

          {mensajes.length === 0 ? (
            /* Premium Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center my-auto pb-8">
              {/* Animated Icon */}
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/20 flex items-center justify-center shadow-xl shadow-secondary/10">
                  <MessageSquare size={36} className="text-secondary" />
                </div>
                {/* Glow Effect */}
                <div className="absolute inset-0 w-20 h-20 rounded-3xl bg-secondary/20 blur-xl -z-10"></div>
                {/* Sparkle */}
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shadow-md">
                  <Sparkles size={12} className="text-secondary" />
                </div>
              </div>

              {/* Welcome Text */}
              <h1 className="text-[28px] font-bold mb-4 tracking-tight text-text-primary">
                Hola, soy PetroChat
              </h1>
              <p className="text-[15px] text-text-secondary max-w-md font-medium leading-relaxed mb-8">
                {documentoActivo
                  ? `Estoy analizando "${documentoActivo.filename}". Hazme cualquier pregunta sobre su contenido.`
                  : 'Tu asistente inteligente con capacidades de análisis documental. Sube archivos en el panel lateral para comenzar.'}
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-3">
                {documentoActivo ? (
                  <>
                    <div className="px-4 py-2 rounded-xl bg-surface border border-border text-[13px] font-medium text-text-secondary">
                      📄 Analizando: {documentoActivo.filename}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2.5 rounded-xl bg-surface border border-border text-[13px] font-medium text-text-primary">
                      💡 Puedo responder preguntas sobre tus documentos
                    </div>
                    <div className="px-4 py-2.5 rounded-xl bg-surface border border-border text-[13px] font-medium text-text-primary">
                      ⚡ Respuestas en tiempo real
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 pt-4">
              {mensajes.map((mensaje) => (
                <Message key={mensaje.id} mensaje={mensaje} />
              ))}
              <div ref={refFinal} className="h-4 shrink-0" />
            </div>
          )}
        </div>
      </div>

      {/* Premium Input Area - Glassmorphism */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-bg via-bg/95 to-transparent pt-8 pb-6 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto">
          <form 
            onSubmit={manejarEnvio} 
            className="relative group"
          >
            {/* Outer Glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-secondary/20 via-primary/10 to-secondary/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            
            {/* Input Container */}
            <div className="relative backdrop-blur-xl bg-surface/90 border border-border/50 rounded-2xl shadow-xl shadow-black/5 overflow-hidden transition-all duration-200 group-focus-within:border-secondary/30">
              <div className="flex items-end min-h-[56px]">
                <textarea
                  ref={refInput}
                  value={inputTexto}
                  onChange={(e) => setInputTexto(e.target.value)}
                  placeholder={documentoActivo ? "Haz una pregunta al documento..." : "Escribe tu mensaje..."}
                  disabled={enviando}
                  rows={1}
                  className="flex-1 bg-transparent border-none pl-5 pr-4 py-4 text-[15px] outline-none text-text-primary resize-none max-h-40"
                  style={{ lineHeight: '1.5' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      manejarEnvio(e)
                    }
                  }}
                />
                <div className="p-2 shrink-0 pr-3">
                  <button
                    type="submit"
                    disabled={!inputTexto.trim() || enviando}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${
                      !inputTexto.trim() || enviando 
                        ? 'bg-border/50 text-text-secondary/50' 
                        : 'bg-gradient-to-br from-secondary to-secondary-dark text-white hover:shadow-lg hover:shadow-secondary/25 active:scale-95'
                    }`}
                  >
                    {enviando
                      ? <Loader2 size={18} className="animate-spin" />
                      : <Send size={16} />
                    }
                  </button>
                </div>
              </div>
            </div>
          </form>
          
          {/* Footer Note */}
          <p className="text-center text-[11px] text-text-secondary/60 mt-3 font-medium">
            PetroChat puede cometer errores. Verifica información importante.
          </p>
        </div>
      </div>
    </div>
  )
}
