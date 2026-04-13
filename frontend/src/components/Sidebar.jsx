/**
 * Barra lateral del chat.
 * Muestra la lista de documentos, botón de subida, e info del usuario.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Upload, Trash2, LogOut, Plus,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, Search
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
  
  // Nuevo estado para filtro de búsqueda
  const [filtroTexto, setFiltroTexto] = useState('')

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

  const documentosFiltrados = documentos.filter(doc => 
    doc.filename.toLowerCase().includes(filtroTexto.toLowerCase())
  )

  return (
    <div className={`flex flex-col h-full bg-surface border-r border-border transition-all duration-300 ease-in-out relative ${colapsada ? 'w-16' : 'w-72 lg:w-80'}`}>
      
      {/* Header Sidebar */}
      <div className="px-4 py-5 flex items-center justify-between border-b border-border/50">
        {!colapsada && (
          <div className="flex items-center gap-2.5 overflow-hidden animate-fade-in">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0 shadow-sm shadow-secondary/20">
              <span className="text-white font-['Outfit'] font-bold leading-none">P</span>
            </div>
            <span className="font-bold text-base font-['Outfit'] tracking-tight truncate">PetroChat</span>
          </div>
        )}
        <button 
          onClick={() => setColapsada(!colapsada)}
          className={`p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${colapsada ? 'mx-auto' : ''}`}
          title={colapsada ? "Expandir barra lateral" : "Colapsar barra lateral"}
        >
          {colapsada ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Acciones principales (Botón Subir) */}
      <div className="p-4 border-b border-border/50">
        {colapsada ? (
          <button 
            onClick={() => { setColapsada(false); setMostrarUpload(true) }}
            className="w-full flex justify-center p-2 rounded-lg bg-secondary text-white hover:bg-secondary-dark transition-colors shadow-sm"
            title="Subir documento"
          >
            <Plus size={20} />
          </button>
        ) : (
          <button 
            onClick={() => setMostrarUpload(!mostrarUpload)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all shadow-sm group"
          >
            <Upload size={16} className="transition-transform group-hover:-translate-y-1" />
            <span>Subir Documento</span>
          </button>
        )}
      </div>

      {/* Panel de Subida Expansible */}
      {!colapsada && mostrarUpload && (
        <div className="px-4 py-3 bg-surface border-b border-border/50 animate-slide-up">
          <FileUpload
            onDocumentoSubido={manejarDocumentoSubido}
            onCerrar={() => setMostrarUpload(false)}
          />
        </div>
      )}

      {/* Buscador */}
      {!colapsada && (
        <div className="px-4 pt-4 pb-2">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar documento..." 
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* Lista de Documentos */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {!colapsada && (
          <p className="text-xs font-semibold px-2 mb-2 text-text-secondary uppercase tracking-wider">
            Mis Documentos
          </p>
        )}

        {error && !colapsada && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 mx-2 rounded-lg bg-error/10 text-error text-xs border border-error/20">
            <AlertCircle size={14} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="hover:opacity-70">✕</button>
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary/50" />
          </div>
        ) : documentosFiltrados.length === 0 ? (
          !colapsada && (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4 opacity-70">
              <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center mb-3">
                <FileText size={20} className="text-text-secondary" />
              </div>
              <p className="text-sm text-text-primary font-medium">No se encontraron documentos</p>
              <p className="text-xs text-text-secondary mt-1">
                {documentos.length === 0 ? "Sube un archivo PDF o DOCX para comenzar" : "Intenta con otra búsqueda"}
              </p>
            </div>
          )
        ) : (
          <div className="space-y-1">
            {documentosFiltrados.map((doc) => {
              const activo = documentoActivo?.id === doc.id
              if (colapsada) {
                return (
                  <button 
                    key={doc.id}
                    onClick={() => onSeleccionarDocumento(doc)}
                    title={doc.filename}
                    className={`w-10 h-10 mx-auto flex items-center justify-center rounded-lg transition-colors ${activo ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-bg hover:text-text-primary'}`}
                  >
                    <FileText size={18} />
                  </button>
                )
              }
              return (
                <div
                  key={doc.id}
                  onClick={() => onSeleccionarDocumento(doc)}
                  className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${activo ? 'bg-primary/5 border-primary/20 shadow-sm' : 'border-transparent hover:bg-bg hover:border-border/50'}`}
                >
                  <div className={`p-2 rounded-lg ${activo ? 'bg-primary/10 text-primary' : 'bg-surface text-text-secondary shadow-sm shadow-black/5'} transition-colors`}>
                    <FileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate font-medium ${activo ? 'text-primary' : 'text-text-primary group-hover:text-primary transition-colors'}`}>
                      {doc.filename}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 truncate flex items-center gap-1.5">
                      <span>{doc.chunk_count} fragmentos</span>
                      <span className="w-1 h-1 rounded-full bg-border"></span>
                      <span className={doc.status === 'listo' ? 'text-success' : 'text-warning'}>
                        {doc.status === 'listo' ? 'Listo' : 'Procesando...'}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => manejarEliminar(e, doc.id)}
                    className="p-1.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-error hover:bg-error/10 rounded-md"
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

      {/* Footer Usuario */}
      <div className="p-4 border-t border-border/50 bg-bg/30">
        {colapsada ? (
           <button onClick={manejarCerrarSesion}
                   className="w-10 h-10 mx-auto rounded-full flex items-center justify-center bg-error/10 text-error hover:bg-error hover:text-white transition-colors"
                   title="Cerrar sesión">
             <LogOut size={16} />
           </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-primary text-white shadow-sm ring-2 ring-surface">
              {usuario?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-text-primary">{usuario?.email?.split('@')[0] || 'Usuario'}</p>
              <p className="text-xs truncate text-text-secondary">Conectado</p>
            </div>
            <button onClick={manejarCerrarSesion}
                    className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                    title="Cerrar sesión">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
