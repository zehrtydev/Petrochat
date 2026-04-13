import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Copy, Check, Bot } from 'lucide-react'

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

  // Generar timestamp si no existe
  const timestamp = mensaje.timestamp || new Date(mensaje.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex w-full ${esUsuario ? 'justify-end' : 'justify-start'} animate-slide-up group`}>
      <div className={`flex gap-4 w-full ${esUsuario ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar AI */}
        {!esUsuario && (
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 mt-1 shadow-sm">
            <Bot size={18} />
          </div>
        )}

        {/* Contenido principal */}
        <div className={`flex flex-col min-w-0 ${esUsuario ? 'items-end' : 'items-start w-full'}`}>
          
          {/* Metadatos superiores (Ocultos en diseño limpio tipo ChatGPT, pero guardamos el header para contexto opcional o lo obviamos. Mejor sin header para IA pura) */}
          <div className="flex items-center gap-2 mb-1 px-1">
            <span className="text-[13px] font-semibold text-text-primary">
              {esUsuario ? 'Tú' : 'PetroChat'}
            </span>
          </div>

          {/* Área de texto/Burbuja */}
          <div className={`relative px-5 py-3 ${
            esUsuario 
              ? 'bg-surface border border-border text-text-primary rounded-[24px] max-w-[85%] sm:max-w-[70%]' 
              : 'bg-transparent text-text-primary w-full max-w-full'
          }`}>
            {mensaje.escribiendo ? (
              <div className="flex items-center gap-1.5 h-6 px-1">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            ) : (
               esUsuario ? (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{mensaje.texto}</p>
              ) : (
                <div className="markdown-body text-[15px] max-w-full w-full">
                  <ReactMarkdown>{mensaje.texto}</ReactMarkdown>
                </div>
              )
            )}
          </div>

          {/* Acciones Inferiores (Sólo Bot) */}
          {!esUsuario && !mensaje.escribiendo && (
             <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-200">
               <button
                 onClick={manejarCopiar}
                 className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border transition-colors"
                 title="Copiar mensaje"
               >
                 {copiado ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                 {copiado ? 'Copiado' : 'Copiar'}
               </button>
             </div>
           )}
        </div>

      </div>
    </div>
  )
}
