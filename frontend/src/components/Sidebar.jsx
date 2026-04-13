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

export default function Sidebar({ documentoActivo, onSeleccionarDocumento }) {  const { usuario, cerrarSesion, obtenerToken } = useAuth()
  const [documentos, setDocumentos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarUpload, setMostrarUpload] = useState(false)
  const [eliminando, setEliminando] = useState(null)
  const [colapsada, setColapsada] = useState(false)
  const [error, setError] = useState(null)
  const [filtroTexto, setFiltroTexto] = useState('')

  const cargarDocumentos = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)
      const token = await obtenerToken()
      const docs = await obtenerDocumentos(token)
      setDocumentos(docs)
    } catch (err) {
      setError('Error al cargar documentos.')
      console.error('Error:', err)
    } finally {
      setCargando(false)
    }
  }, [obtenerToken])

  useEffect(() => {
    cargarDocumentos()
  }, [cargarDocumentos])

  const manejarEliminar = useCallback(async (e, docId) => {
    e.stopPropagation()
    if (!confirm('¿Seguro de que deseas eliminar este documento?')) return

    try {
      setEliminando(docId)
      const token = await obtenerToken()
      await eliminarDocumento(docId, token)
      setDocumentos(prev => prev.filter(d => d.id !== docId))

      if (documentoActivo?.id === docId) {
        onSeleccionarDocumento(null)
      }
    } catch (err) {
      setError('Hubo un error al eliminar.')
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
    }
  }, [cerrarSesion])

  const documentosFiltrados = documentos.filter(doc => 
    doc.filename.toLowerCase().includes(filtroTexto.toLowerCase())
  )

  return (
    <div className={`flex flex-col h-full bg-surface border-r border-border transition-all duration-300 ease-in-out relative ${colapsada ? 'w-16' : 'w-72 lg:w-80'}`}>
      
      {/* Header Sidebar */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
        {!colapsada && (
          <div className="flex items-center gap-3 overflow-hidden animate-fade-in flex-1">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm border border-border/50">
              <span className="text-white font-['Outfit'] font-bold text-sm leading-none">P</span>
            </div>
            <span className="font-semibold text-[15px] font-['Outfit'] tracking-tight truncate text-text-primary">PetroChat</span>
          </div>
        )}
        <button 
          onClick={() => setColapsada(!colapsada)}
          className={`p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors ${colapsada ? 'mx-auto' : ''}`}
          title={colapsada ? "Expandir" : "Contraer"}
        >
          {colapsada ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Acción Subir Documento */}
      <div className="p-4">
        {colapsada ? (
          <button 
            onClick={() => { setColapsada(false); setMostrarUpload(true) }}
            className="w-full flex justify-center p-2 rounded-xl bg-secondary text-white hover:bg-secondary-dark transition-colors shadow-[0_2px_8px_-2px_rgba(245,158,11,0.4)]"
            title="Subir documento"
          >
            <Plus size={18} />
          </button>
        ) : (
          <button 
            onClick={() => setMostrarUpload(!mostrarUpload)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-secondary transition-all shadow-md group"
          >
            <Upload size={16} className="transition-transform group-hover:-translate-y-0.5" />
            <span>Subir Documento</span>
          </button>
        )}
      </div>

      {/* Upload Panel */}
      {!colapsada && mostrarUpload && (
        <div className="px-4 pb-4 animate-slide-up">
          <FileUpload
            onDocumentoSubido={manejarDocumentoSubido}
            onCerrar={() => setMostrarUpload(false)}
          />
        </div>
      )}

      {/* Buscador */}
      {!colapsada && (
        <div className="px-4 pb-2">
          <div className="relative group">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar archivo..." 
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full bg-bg border border-border rounded-[10px] pl-9 pr-3 py-1.5 text-[13px] text-text-primary outline-none focus:border-secondary transition-all shadow-inner"
            />
          </div>
        </div>
      )}

      {/* Lista de Documentos */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {!colapsada && (
          <p className="text-[11px] font-semibold px-2 mb-2 mt-2 text-text-secondary uppercase tracking-[0.08em]">
            Archivos
          </p>
        )}

        {error && !colapsada && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 mx-1 rounded-lg bg-error/10 text-error text-[12px] border border-error/20">
            <AlertCircle size={14} className="shrink-0"/>
            <span className="flex-1 truncate">{error}</span>
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-secondary" />
          </div>
        ) : documentosFiltrados.length === 0 ? (
          !colapsada && (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-bg border border-border mb-3">
                <FileText size={16} className="text-text-secondary" />
              </div>
              <p className="text-[13px] text-text-primary font-medium">Bandeja vacía</p>
              <p className="text-[12px] text-text-secondary mt-1">
                {documentos.length === 0 ? "Sube un archivo para comenzar" : "Sin resultados"}
              </p>
            </div>
          )
        ) : (
          documentosFiltrados.map((doc) => {
            const activo = documentoActivo?.id === doc.id
            if (colapsada) {
              return (
                <button 
                  key={doc.id}
                  onClick={() => onSeleccionarDocumento(doc)}
                  title={doc.filename}
                  className={`w-10 h-10 mx-auto flex flex-col items-center justify-center rounded-xl transition-all ${activo ? 'bg-secondary text-white shadow-md' : 'text-text-secondary hover:bg-bg hover:text-text-primary'}`}
                >
                  <FileText size={16} />
                </button>
              )
            }
            return (
              <div
                key={doc.id}
                onClick={() => onSeleccionarDocumento(doc)}
                className={`group flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all border ${activo ? 'bg-bg border-border shadow-sm' : 'border-transparent hover:bg-bg/50'}`}
              >
                <div className={`p-2 rounded-lg flex items-center justify-center ${activo ? 'bg-secondary text-white shadow-sm' : 'bg-surface border border-border text-text-secondary group-hover:text-primary'} transition-colors`}>
                  <FileText size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] truncate font-medium ${activo ? 'text-primary' : 'text-text-primary group-hover:text-primary transition-colors'}`}>
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-text-secondary truncate">{doc.chunk_count} frags</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-border"></span>
                    <span className={`text-[11px] font-medium truncate ${doc.status === 'listo' ? 'text-success' : 'text-warning'}`}>
                      {doc.status === 'listo' ? 'Listo' : 'Procesando'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => manejarEliminar(e, doc.id)}
                  className="p-1.5 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity hover:text-error hover:bg-error/10 rounded-md"
                  title="Eliminar"
                >
                  {eliminando === doc.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Trash2 size={14} />
                  }
                </button>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Usuario */}
      <div className="p-4 border-t border-border/50 shrink-0">
        {colapsada ? (
           <button onClick={manejarCerrarSesion}
                   className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-text-secondary hover:bg-error/10 hover:text-error transition-colors"
                   title="Cerrar sesión">
             <LogOut size={16} />
           </button>
        ) : (
          <div className="flex items-center gap-3 bg-bg p-2 rounded-2xl border border-border">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold bg-primary text-white shadow-sm">
              {usuario?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold truncate text-text-primary">{usuario?.email?.split('@')[0] || 'User'}</p>
              <p className="text-[11px] truncate text-success font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
              </p>
            </div>
            <button onClick={manejarCerrarSesion}
                    className="p-2 text-text-secondary hover:text-error rounded-lg transition-colors"
                    title="Salir">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
