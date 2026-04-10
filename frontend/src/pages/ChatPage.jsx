/**
 * Página principal del chat.
 * Layout: barra lateral + área de chat estilo ChatGPT.
 */

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'

export default function ChatPage() {
  const [documentoActivo, setDocumentoActivo] = useState(null)

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
      {/* Barra lateral */}
      <Sidebar
        documentoActivo={documentoActivo}
        onSeleccionarDocumento={setDocumentoActivo}
      />

      {/* Área de chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header del chat */}
        <div className="px-6 py-4 flex items-center gap-3"
             style={{
               backgroundColor: 'var(--color-surface)',
               borderBottom: '1px solid var(--color-border)',
             }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center gradient-primary">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h1 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              PetroChat
            </h1>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {documentoActivo
                ? `Analizando: ${documentoActivo.filename}`
                : 'Asistente inteligente de documentos'}
            </p>
          </div>

          {/* Indicador de estado */}
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-success)' }}></span>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              En línea
            </span>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <Chat documentoActivo={documentoActivo} />
        </div>
      </div>
    </div>
  )
}
