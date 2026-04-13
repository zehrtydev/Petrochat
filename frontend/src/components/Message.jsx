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
      <div className={`flex gap-4 max-w-[85%] sm:max-w-[75%] ${esUsuario ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar AI */}
        {!esUsuario && (
          <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center shrink-0 mt-1 shadow-sm">
            <span className="font-['Outfit'] font-bold text-sm">P</span>
          </div>
        )}

        {/* Contenido principal */}
        <div className={`flex flex-col ${esUsuario ? 'items-end' : 'items-start'}`}>
          
          {/* Metadatos superiores */}
          <div className="flex items-center gap-2 mb-1.5 px-1">
            <span className="text-[13px] font-semibold text-text-primary">
              {esUsuario ? 'Tú' : 'PetroChat IA'}
            </span>
            <span className="text-[11px] text-text-secondary font-medium">
              {timestamp}
            </span>
          </div>

          {/* Burbuja */}
          <div className={`relative px-5 py-3.5 shadow-sm ${
            esUsuario 
              ? 'bg-text-primary text-bg rounded-[20px] rounded-tr-sm border border-transparent' 
              : 'bg-surface text-text-primary rounded-[20px] rounded-tl-sm border border-border/70 dark:bg-[#050505]'
          }`}>
            {mensaje.escribiendo ? (
              <div className="flex items-center gap-1.5 h-6 px-1">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            ) : (
               esUsuario ? (
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-bg">{mensaje.texto}</p>
              ) : (
                <div className="markdown-body text-[15px]">
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
