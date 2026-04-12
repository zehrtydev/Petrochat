/**
 * Barra lateral del chat.
 * Muestra la lista de documentos, botón de subida, e info del usuario.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Upload, Trash2, LogOut, Plus,
  ChevronLeft, ChevronRight, Loader2, AlertCircle
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
  const [error, setError] = useState(null)

  const cargarDocumentos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const token = await obtenerToken()
      const docs = await obtenerDocumentos(token)
      setDocumentos(docs)
    } catch (err) {
      setError('Error al cargar documentos. Intenta de nuevo.')
      console.error('Error al cargar documentos:', err)
    } finally {
      setCargando(false)
    }
  }, [obtenerToken])

  useEffect(() => {
    cargarDocumentos()
  }, [cargarDocumentos])

  const manejarEliminar = useCallback(async (e, docId) => {
    e.stopPropagation()
    if (!confirm('¿Estás seguro de que querés eliminar este documento?')) return

    try {
      setEliminando(docId)
      const token = await obtenerToken()
      await eliminarDocumento(docId, token)
      setDocumentos(prev => prev.filter(d => d.id !== docId))

      if (documentoActivo?.id === docId) {
        onSeleccionarDocumento(null)
      }
    } catch (err) {
      setError('Error al eliminar el documento. Intenta de nuevo.')
      console.error('Error al eliminar:', err)
    } finally {
      setEliminando(null)
    }
  }, [obtenerToken, documentoActivo, onSeleccionarDocumento])

  const manejarDocumentoSubido = useCallback((resultado) => {
    cargarDocumentos()
    setMostrarUpload(false)
  }, [cargarDocumentos])

  const manejarCerrarSesion = useCallback(async () => {
    try {
      await cerrarSesion()
    } catch (err) {
      setError('Error al cerrar sesión.')
      console.error('Error al cerrar sesión:', err)
    }
  }, [cerrarSesion])

  if (colapsada) {
    return (
      <div className="w-16 flex flex-col items-center py-4 gap-4 sidebar-collapsed">
        <button onClick={() => setColapsada(false)}
                className="sidebar-icon-btn"
                title="Expandir barra lateral">
          <ChevronRight size={20} />
        </button>
        <button onClick={() => { setColapsada(false); setMostrarUpload(true) }}
                className="sidebar-icon-btn sidebar-icon-btn-primary"
                title="Subir documento">
          <Plus size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="w-72 flex flex-col h-full sidebar">
      <div className="px-4 py-5 flex items-center justify-between sidebar-header">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center sidebar-logo">
            <span className="text-lg">🤖</span>
          </div>
          <span className="font-bold text-base">PetroChat</span>
        </div>
        <button onClick={() => setColapsada(true)}
                className="sidebar-icon-btn"
                title="Colapsar barra lateral">
          <ChevronLeft size={18} />
        </button>
      </div>

      <div className="px-4 py-3">
        <button onClick={() => setMostrarUpload(!mostrarUpload)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium sidebar-upload-btn">
          <Upload size={16} />
          Subir Documento
        </button>
      </div>

      {mostrarUpload && (
        <div className="px-4 pb-3">
          <div className="rounded-xl p-3 sidebar-upload-panel">
            <FileUpload
              onDocumentoSubido={manejarDocumentoSubido}
              onCerrar={() => setMostrarUpload(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-xs font-medium px-2 mb-2 sidebar-section-title">
          MIS DOCUMENTOS
        </p>

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg bg-red-500/20 text-red-300 text-sm">
            <AlertCircle size={14} />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">✕</button>
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin sidebar-loading" />
          </div>
        ) : documentos.length === 0 ? (
          <div className="text-center py-8 px-2">
            <FileText size={32} className="mx-auto mb-3 sidebar-empty-icon" />
            <p className="text-sm sidebar-empty-text">No hay documentos todavía</p>
            <p className="text-xs sidebar-empty-hint">Subí un PDF o DOCX para empezar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {documentos.map((doc) => {
              const activo = documentoActivo?.id === doc.id
              return (
                <div
                  key={doc.id}
                  onClick={() => onSeleccionarDocumento(doc)}
                  className="sidebar-doc-item"
                  data-activo={activo}
                >
                  <FileText size={16} className="flex-shrink-0 sidebar-doc-icon" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{doc.filename}</p>
                    <p className="text-xs sidebar-doc-meta">
                      {doc.chunk_count} fragmentos • {doc.status === 'listo' ? '✓ Listo' : '⏳ Procesando'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => manejarEliminar(e, doc.id)}
                    className="sidebar-delete-btn"
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

      <div className="px-4 py-3 sidebar-footer">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold sidebar-avatar">
            {usuario?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">{usuario?.email || 'Usuario'}</p>
          </div>
          <button onClick={manejarCerrarSesion}
                  className="sidebar-logout-btn"
                  title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
