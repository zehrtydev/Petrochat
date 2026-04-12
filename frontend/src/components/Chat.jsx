/**
 * Componente de chat principal.
 * Muestra mensajes, input de texto, y maneja el streaming de respuestas.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, MessageSquare } from 'lucide-react'
import Message from './Message'
import { enviarMensaje, procesarStream } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function Chat({ documentoActivo }) {
  const { obtenerToken } = useAuth()
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
    
    const mensajeUsuario = {
      id: Date.now(),
      rol: 'usuario',
      texto: pregunta,
    }

    const idBot = Date.now() + 1
    const mensajeBot = {
      id: idBot,
      rol: 'bot',
      texto: '',
      escribiendo: true,
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
    <div className="flex flex-col h-full">
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {errorGlobal && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {errorGlobal}
          </div>
        )}
        
        {mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                 style={{ backgroundColor: 'rgba(50,65,88,0.08)' }}>
              <MessageSquare size={32} style={{ color: 'var(--color-primary-light)' }} />
            </div>
            <h3 className="text-lg font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}>
              {documentoActivo
                ? `Preguntá sobre "${documentoActivo.filename}"`
                : 'Bienvenido a PetroChat'}
            </h3>
            <p className="text-sm max-w-md"
               style={{ color: 'var(--color-text-secondary)' }}>
              {documentoActivo
                ? 'Escribí tu pregunta y el asistente te responderá basándose en el contenido del documento.'
                : 'Subí un documento desde la barra lateral y empezá a hacer preguntas sobre su contenido.'}
            </p>
          </div>
        ) : (
          <>
            {mensajes.map((mensaje) => (
              <Message key={mensaje.id} mensaje={mensaje} />
            ))}
            <div ref={refFinal} />
          </>
        )}
      </div>

      {/* Barra de input */}
      <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        {documentoActivo && (
          <div className="text-xs mb-2 px-1 flex items-center gap-1.5"
               style={{ color: 'var(--color-text-secondary)' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }}></span>
            Consultando: {documentoActivo.filename}
          </div>
        )}

        <form onSubmit={manejarEnvio} className="flex gap-3">
          <input
            ref={refInput}
            type="text"
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            placeholder={documentoActivo
              ? 'Escribí tu pregunta sobre el documento...'
              : 'Seleccioná un documento para empezar...'}
            disabled={enviando}
            maxLength={2000}
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={!inputTexto.trim() || enviando}
            className="btn-primary px-4"
          >
            {enviando
              ? <Loader2 size={20} className="animate-spin" />
              : <Send size={20} />
            }
          </button>
        </form>
      </div>
    </div>
  )
}
