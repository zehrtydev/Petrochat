import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, MessageSquare, Moon, Sun } from 'lucide-react'
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
      
      {/* Header Top Minimalista (Estilo ChatGPT / Clean) */}
      <div className="absolute top-0 w-full flex items-center justify-between px-4 py-3 z-20 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-surface/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border">
          <span className="font-semibold text-[14px] text-text-primary">
            {documentoActivo ? 'Chat Documental' : 'ChatGPT'} <span className="text-text-secondary font-normal">v2</span>
          </span>
        </div>
        
        <button 
          onClick={toggleTema}
          className="pointer-events-auto p-2 rounded-full border border-border bg-surface text-text-secondary hover:text-text-primary transition-colors focus:ring-2 ring-primary/20"
        >
          {tema === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Área Central de Scroll */}
      <div className="flex-1 overflow-y-auto w-full scroll-smooth pt-16">
        <div className="max-w-3xl mx-auto w-full px-4 lg:px-8 pb-36 min-h-full flex flex-col">
          
          {errorGlobal && (
            <div className="mb-6 bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-[14px] flex gap-3 items-center">
               <span className="text-xl">⚠️</span> 
               <span>{errorGlobal}</span>
            </div>
          )}

          {mensajes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-90 my-auto pb-20">
              <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 shadow-sm">
                <MessageSquare size={28} className="text-text-primary" />
              </div>
              <h1 className="text-[24px] font-semibold mb-3 tracking-tight text-text-primary">
                ¿En qué te puedo ayudar hoy?
              </h1>
              <p className="text-[14px] text-text-secondary max-w-sm font-medium">
                {documentoActivo
                  ? `Haciendo focus sobre "${documentoActivo.filename}"`
                  : 'Sube un archivo en el panel izquierdo para análisis profundo, o chatea normalmente.'}
              </p>
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

      {/* Barra de input Ominprésente (Estilo ChatGPT - Pill Flotante) */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-bg via-bg to-transparent pt-6 pb-6 px-4 pointer-events-none">
        <div className="max-w-3xl mx-auto w-full pointer-events-auto relative">
          <form onSubmit={manejarEnvio} className="relative shadow-sm rounded-2xl bg-surface border border-border flex items-end min-h-[52px]">
            <input
              ref={refInput}
              type="text"
              value={inputTexto}
              onChange={(e) => setInputTexto(e.target.value)}
              placeholder={documentoActivo ? "Haz una pregunta al documento..." : "Mensaje a PetroChat..."}
              disabled={enviando}
              className="flex-1 bg-transparent border-none pl-4 pr-1 py-4 text-[15px] outline-none text-text-primary min-w-0"
              style={{ lineHeight: '1.4' }}
            />
            <div className="p-2 shrink-0">
              <button
                type="submit"
                disabled={!inputTexto.trim() || enviando}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                  !inputTexto.trim() || enviando 
                    ? 'bg-border/50 text-text-secondary/50' 
                    : 'bg-text-primary text-bg hover:opacity-80 active:scale-95'
                }`}
              >
                {enviando
                  ? <Loader2 size={18} className="animate-spin" />
                  : <Send size={15} className={`${inputTexto.trim() ? 'translate-x-[1px]' : ''}`} />
                }
              </button>
            </div>
          </form>
          <p className="text-center text-[10.5px] text-text-secondary mt-3 mx-4 leading-relaxed">
            PetroChat puede cometer errores. Considera verificar la información importante obtenida de los documentos.
          </p>
        </div>
      </div>
    </div>
  )
}
