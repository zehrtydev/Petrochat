/**
 * Componente de mensaje individual en el chat.
 * Diferencia visualmente entre mensajes del usuario y del bot.
 */

import ReactMarkdown from 'react-markdown'
import { User, Bot } from 'lucide-react'

export default function Message({ mensaje }) {
  const esUsuario = mensaje.rol === 'usuario'

  return (
    <div className={`flex gap-3 animate-fade-in ${esUsuario ? 'justify-end' : 'justify-start'}`}>
      {/* Avatar del bot (solo para mensajes del bot) */}
      {!esUsuario && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
             style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-dark)' }}>
          <Bot size={18} />
        </div>
      )}

      {/* Burbuja del mensaje */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${esUsuario ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
        style={esUsuario ? {
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-text-on-dark)',
        } : {
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        }}
      >
        {esUsuario ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{mensaje.texto}</p>
        ) : (
          <div className="markdown-body text-sm leading-relaxed">
            <ReactMarkdown>{mensaje.texto}</ReactMarkdown>
          </div>
        )}

        {/* Indicador de escritura */}
        {mensaje.escribiendo && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      {/* Avatar del usuario (solo para mensajes del usuario) */}
      {esUsuario && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
             style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-on-dark)' }}>
          <User size={18} />
        </div>
      )}
    </div>
  )
}
