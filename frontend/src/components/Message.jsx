import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, Bot, User } from 'lucide-react'

export default function Message({ mensaje }) {
  const esUsuario = mensaje.rol === 'usuario'
  const [copiado, setCopiado] = useState(false)

  const manejarCopiar = async () => {
    if (!mensaje.texto) return
    try {
      await navigator.clipboard.writeText(mensaje.texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error('Error al copiar texto:', err)
    }
  }

  const timestamp = mensaje.timestamp || new Date(mensaje.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex w-full animate-fade-in ${esUsuario ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-4 max-w-[85%] ${esUsuario ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`shrink-0 mt-1 ${esUsuario ? '' : ''}`}>
          {esUsuario ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <User size={18} className="text-white" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary-dark flex items-center justify-center shadow-lg shadow-secondary/20">
              <Bot size={18} className="text-white" />
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className={`flex flex-col ${esUsuario ? 'items-end' : 'items-start'}`}>
          
          {/* Message Bubble */}
          <div className={`relative group/message px-5 py-4 ${
            esUsuario 
              ? 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl rounded-tr-md shadow-lg shadow-primary/20' 
              : 'bg-surface border border-border/50 rounded-2xl rounded-tl-md shadow-sm'
          }`}>
            {mensaje.escribiendo ? (
              <div className="flex items-center gap-1.5 h-6">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            ) : esUsuario ? (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{mensaje.texto}</p>
            ) : (
              <div className="markdown-body text-[15px] max-w-full w-full prose prose-sm dark:prose-invert">
                <ReactMarkdown>{mensaje.texto}</ReactMarkdown>
              </div>
            )}

            {/* Subtle gradient overlay for user messages */}
            {esUsuario && (
              <div className="absolute inset-0 rounded-2xl rounded-tr-md bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
            )}
          </div>

          {/* Actions & Meta */}
          <div className={`flex items-center gap-2 mt-1.5 ${esUsuario ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Timestamp */}
            <span className="text-[10px] text-text-secondary/50 font-medium">
              {timestamp}
            </span>

            {/* Copy Button - Only for Bot */}
            {!esUsuario && !mensaje.escribiendo && (
              <button
                onClick={manejarCopiar}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                  copiado 
                    ? 'bg-success/10 text-success border border-success/20' 
                    : 'text-text-secondary/60 hover:text-text-primary hover:bg-bg border border-transparent'
                }`}
                title="Copiar mensaje"
              >
                {copiado ? (
                  <>
                    <Check size={12} />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
