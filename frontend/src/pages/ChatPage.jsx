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
    <div className="flex h-screen bg-bg overflow-hidden relative">
      {/* Barra lateral */}
      <Sidebar
        documentoActivo={documentoActivo}
        onSeleccionarDocumento={setDocumentoActivo}
      />

      {/* Área de chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        <Chat documentoActivo={documentoActivo} />
      </div>
    </div>
  )
}
