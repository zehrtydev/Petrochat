import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { User, Bot, Copy, Check } from 'lucide-react'

export default function Message({ mensaje }) {
  const esUsuario = mensaje.rol === 'usuario'
  const [copiado, setCopiado] = useState(false)

  const manejarCopiar = () => {
    if (!mensaje.texto) return
    navigator.clipboard.writeText(mensaje.texto).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  // Generar timestamp si no existe (formato HH:MM)
  const timestamp = mensaje.timestamp || new Date(mensaje.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex w-full animate-fade-in group ${esUsuario ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex gap-3 max-w-[85%] lg:max-w-[75%] ${esUsuario ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${esUsuario ? 'bg-secondary text-white' : 'bg-primary text-white'}`}>
          {esUsuario ? <User size={16} /> : <span className="font-['Outfit'] font-bold text-sm">P</span>}
        </div>

        {/* Contenido principal */}
        <div className="flex flex-col gap-1 min-w-0">
          
          {/* Header del mensaje (Nombre + Hora) */}
          <div className={`flex items-center gap-2 px-1 ${esUsuario ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs font-medium text-text-primary">
              {esUsuario ? 'Tú' : 'PetroChat'}
            </span>
            <span className="text-[10px] text-text-secondary">{timestamp}</span>
          </div>

          {/* Burbuja del mensaje */}
          <div className="relative group/bubble">
            <div
              className={`px-4 py-3 shadow-sm ${
                esUsuario 
                  ? 'bg-secondary text-white rounded-2xl rounded-tr-sm' 
                  : 'bg-surface text-text-primary border border-border rounded-2xl rounded-tl-sm'
              }`}
            >
              {esUsuario ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{mensaje.texto}</p>
              ) : (
                <div className="markdown-body text-sm leading-relaxed">
                  <ReactMarkdown>{mensaje.texto}</ReactMarkdown>
                </div>
              )}

              {/* Indicador de escritura animado */}
              {mensaje.escribiendo && (
                <div className="flex gap-1.5 px-2 py-3">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
            </div>

            {/* Acción: Copy to Clipboard (Solo Bot) */}
            {!esUsuario && !mensaje.escribiendo && (
              <div className="absolute -right-10 top-2 opacity-0 group-hover/bubble:opacity-100 transition-opacity">
                <button
                  onClick={manejarCopiar}
                  className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-md transition-colors"
                  title="Copiar mensaje"
                >
                  {copiado ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
