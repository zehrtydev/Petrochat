/**
 * Página principal del chat.
 * Layout: barra lateral + área de chat (responsive).
 */

import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Chat from '../components/Chat'
import { Menu, X } from 'lucide-react'

export default function ChatPage() {
  const [documentoActivo, setDocumentoActivo] = useState(null)
  const [sidebarAbierta, setSidebarAbierta] = useState(false)

  return (
    <div className="flex h-screen bg-bg overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar
        documentoActivo={documentoActivo}
        onSeleccionarDocumento={(doc) => {
          setDocumentoActivo(doc)
          setSidebarAbierta(false)
        }}
        colapsada={!sidebarAbierta}
        onToggle={() => setSidebarAbierta(!sidebarAbierta)}
      />

      {/* Overlay para móvil */}
      {sidebarAbierta && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarAbierta(false)}
        />
      )}

      {/* Botón hamburger para móvil */}
      <button
        onClick={() => setSidebarAbierta(!sidebarAbierta)}
        className="fixed bottom-6 left-6 z-40 lg:hidden w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-secondary-dark text-white shadow-lg shadow-secondary/30 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
      >
        {sidebarAbierta ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        <Chat documentoActivo={documentoActivo} />
      </div>
    </div>
  )
}
