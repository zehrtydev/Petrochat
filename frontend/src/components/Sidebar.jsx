/**
 * Barra lateral del chat.
 * Muestra la lista de documentos, botón de subida, e info del usuario.
 */

import { useState, useEffect } from 'react'
import {
  FileText, Upload, Trash2, LogOut, Plus,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { obtenerDocumentos, eliminarDocumento } from '../services/api'
import FileUpload from './FileUpload'

export default function Sidebar({ documentoActivo, onSeleccionarDocumento }) {
  const { usuario, cerrarSesion, obtenerToken } = useAuth()
  const [documentos, setDocumentos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarUpload, setMostrarUpload] = useState(false)
  const [eliminando, setEliminando] = useState(null)
  const [colapsada, setColapsada] = useState(false)

  /* Cargar documentos al montar */
  useEffect(() => {
    cargarDocumentos()
  }, [])

  async function cargarDocumentos() {
    try {
      setCargando(true)
      const token = obtenerToken()
      const docs = await obtenerDocumentos(token)
      setDocumentos(docs)
    } catch (error) {
      console.error('Error al cargar documentos:', error)
    } finally {
      setCargando(false)
    }
  }

  async function manejarEliminar(e, docId) {
    e.stopPropagation()
    if (!confirm('¿Estás seguro de que querés eliminar este documento?')) return

    try {
      setEliminando(docId)
      const token = obtenerToken()
      await eliminarDocumento(docId, token)
      setDocumentos(prev => prev.filter(d => d.id !== docId))

      /* Si el documento eliminado era el activo, deseleccionar */
      if (documentoActivo?.id === docId) {
        onSeleccionarDocumento(null)
      }
    } catch (error) {
      console.error('Error al eliminar:', error)
    } finally {
      setEliminando(null)
    }
  }

  function manejarDocumentoSubido(resultado) {
    /* Recargar lista de documentos */
    cargarDocumentos()
    setMostrarUpload(false)
  }

  async function manejarCerrarSesion() {
    try {
      await cerrarSesion()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  /* Sidebar colapsada (solo ícono) */
  if (colapsada) {
    return (
      <div className="w-16 flex flex-col items-center py-4 gap-4"
           style={{
             backgroundColor: 'var(--color-primary)',
             borderRight: '1px solid rgba(255,255,255,0.1)',
           }}>
        <button onClick={() => setColapsada(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ color: 'var(--color-text-on-dark)' }}
                title="Expandir barra lateral">
          <ChevronRight size={20} />
        </button>
        <button onClick={() => { setColapsada(false); setMostrarUpload(true) }}
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text-on-dark)' }}
                title="Subir documento">
          <Plus size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="w-72 flex flex-col h-full"
         style={{
           backgroundColor: 'var(--color-primary)',
           color: 'var(--color-text-on-dark)',
         }}>
      {/* Header */}
      <div className="px-4 py-5 flex items-center justify-between"
           style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <span className="text-lg">🤖</span>
          </div>
          <span className="font-bold text-base">PetroChat</span>
        </div>
        <button onClick={() => setColapsada(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                title="Colapsar barra lateral">
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Botón nuevo documento */}
      <div className="px-4 py-3">
        <button onClick={() => setMostrarUpload(!mostrarUpload)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  backgroundColor: 'var(--color-secondary)',
                  color: 'var(--color-text-on-dark)',
                }}>
          <Upload size={16} />
          Subir Documento
        </button>
      </div>

      {/* Panel de subida */}
      {mostrarUpload && (
        <div className="px-4 pb-3">
          <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
            <FileUpload
              onDocumentoSubido={manejarDocumentoSubido}
              onCerrar={() => setMostrarUpload(false)}
            />
          </div>
        </div>
      )}

      {/* Lista de documentos */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-xs font-medium px-2 mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
          MIS DOCUMENTOS
        </p>

        {cargando ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin" style={{ color: 'rgba(255,255,255,0.5)' }} />
          </div>
        ) : documentos.length === 0 ? (
          <div className="text-center py-8 px-2">
            <FileText size={32} className="mx-auto mb-3" style={{ color: 'rgba(255,255,255,0.2)' }} />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              No hay documentos todavía
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Subí un PDF o DOCX para empezar
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {documentos.map((doc) => {
              const activo = documentoActivo?.id === doc.id
              return (
                <div
                  key={doc.id}
                  onClick={() => onSeleccionarDocumento(doc)}
                  className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                  style={{
                    backgroundColor: activo ? 'rgba(255,255,255,0.15)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!activo) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    if (!activo) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <FileText size={16} className="flex-shrink-0"
                            style={{ color: activo ? 'var(--color-secondary)' : 'rgba(255,255,255,0.5)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{doc.filename}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {doc.chunk_count} fragmentos • {doc.status === 'listo' ? '✓ Listo' : '⏳ Procesando'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => manejarEliminar(e, doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                    title="Eliminar documento"
                  >
                    {eliminando === doc.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />
                    }
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Info del usuario + Logout */}
      <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
               style={{ backgroundColor: 'var(--color-secondary)' }}>
            {usuario?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{usuario?.email || 'Usuario'}</p>
          </div>
          <button onClick={manejarCerrarSesion}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'rgba(255,255,255,0.5)' }}
                  title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
