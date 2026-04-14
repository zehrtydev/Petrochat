/**
 * Barra lateral premium estilo SaaS.
 * Muestra la lista de documentos, botón de subida, e info del usuario.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Trash2, LogOut,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, Search, 
  X, CloudUpload, File, Settings, HelpCircle, PanelLeftClose, PanelLeft
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { obtenerDocumentos, eliminarDocumento } from '../services/api'
import FileUpload from './FileUpload'

export default function Sidebar({ documentoActivo, onSeleccionarDocumento, colapsada = false, onToggle }) {
  const { usuario, cerrarSesion, obtenerToken } = useAuth()
  const [documentos, setDocumentos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mostrarUpload, setMostrarUpload] = useState(false)
  const [eliminando, setEliminando] = useState(null)
  const [colapsado, setColapsado] = useState(colapsada)
  const [error, setError] = useState(null)
  const [filtroTexto, setFiltroTexto] = useState('')

  useEffect(() => {
    setColapsado(colapsada)
  }, [colapsada])

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

  const manejarToggle = useCallback(() => {
    if (onToggle) {
      onToggle()
    } else {
      setColapsado(!colapsado)
    }
  }, [colapsado, onToggle])

  const documentosFiltrados = documentos.filter(doc => 
    doc.filename.toLowerCase().includes(filtroTexto.toLowerCase())
  )

  return (
    <aside className={`flex flex-col h-full bg-surface border-r border-border/50 transition-all duration-300 ease-out relative z-40 ${
      colapsado 
        ? 'w-0 lg:w-[72px] overflow-hidden' 
        : 'fixed lg:relative inset-y-0 left-0 w-[280px] lg:w-[280px] -translate-x-full lg:translate-x-0'
    }`}>
      
      {/* Header con Logo */}
      <div className="h-16 flex items-center justify-between px-4 shrink-0 border-b border-border/30">
        {!colapsado ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[16px] text-text-primary tracking-tight">PetroChat</span>
              <span className="text-[10px] text-text-secondary font-medium">Document Assistant</span>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
            <FileText size={18} className="text-white" />
          </div>
        )}
        
        <button 
          onClick={manejarToggle}
          className={`p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-all duration-200 cursor-pointer hidden lg:flex ${colapsado ? 'mx-auto' : ''}`}
          title={colapsado ? "Expandir" : "Contraer"}
        >
          {colapsado ? <ChevronRight size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Botón Upload Premium */}
      <div className="p-3 shrink-0">
        {!colapsado ? (
          <button 
            onClick={() => setMostrarUpload(!mostrarUpload)}
            className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl font-medium text-[14px] transition-all duration-200 cursor-pointer ${
              mostrarUpload 
                ? 'bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg shadow-secondary/25' 
                : 'bg-bg text-text-primary hover:bg-primary/5 hover:text-primary border border-transparent hover:border-border'
            }`}
          >
            {mostrarUpload ? <X size={18} /> : <CloudUpload size={18} />}
            <span>{mostrarUpload ? 'Cerrar' : 'Subir Documento'}</span>
          </button>
        ) : (
          <button 
            onClick={() => {
              if (onToggle) onToggle()
            }}
            className="w-12 h-12 mx-auto flex items-center justify-center rounded-xl bg-gradient-to-r from-secondary to-secondary-dark text-white shadow-lg shadow-secondary/25 transition-all duration-200 hover:scale-105 cursor-pointer"
            title="Subir Documento"
          >
            <CloudUpload size={20} />
          </button>
        )}
      </div>

      {/* Upload Panel */}
      {!colapsado && mostrarUpload && (
        <div className="px-3 pb-3 animate-slide-up">
          <FileUpload
            onDocumentoSubido={manejarDocumentoSubido}
            onCerrar={() => setMostrarUpload(false)}
          />
        </div>
      )}

      {/* Buscador */}
      {!colapsado && (
        <div className="px-3 pb-3 shrink-0">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <Search size={16} className="text-text-secondary/60" />
            </div>
            <input 
              type="text" 
              placeholder="Buscar archivos..." 
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full bg-bg border border-border/50 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-text-primary outline-none placeholder:text-text-secondary/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Lista de Documentos */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {!colapsado && (
          <div className="flex items-center justify-between px-1 py-2 mb-1">
            <span className="text-[11px] font-semibold text-text-secondary/60 uppercase tracking-wider">
              Documentos
            </span>
            <span className="text-[11px] font-medium text-text-secondary/40">
              {documentosFiltrados.length}
            </span>
          </div>
        )}

        {error && !colapsado && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-error/10 text-error text-[12px] border border-error/20">
             <AlertCircle size={14}/> 
             <span>{error}</span>
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-text-secondary">
              <Loader2 size={18} className="animate-spin" />
              {!colapsado && <span className="text-[13px]">Cargando...</span>}
            </div>
          </div>
        ) : documentosFiltrados.length === 0 ? (
          !colapsado && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-xl bg-bg flex items-center justify-center mb-3">
                <File size={20} className="text-text-secondary/40" />
              </div>
              <p className="text-[13px] text-text-secondary font-medium">
                {filtroTexto ? 'Sin resultados' : 'Sin documentos'}
              </p>
              <p className="text-[11px] text-text-secondary/60 mt-1">
                {filtroTexto ? 'Intenta otra búsqueda' : 'Sube un archivo para comenzar'}
              </p>
            </div>
          )
        ) : (
          documentosFiltrados.map((doc) => {
            const activo = documentoActivo?.id === doc.id
            if (colapsado) {
              return (
                <button 
                  key={doc.id}
                  onClick={() => onSeleccionarDocumento(doc)}
                  title={doc.filename}
                  className={`w-12 h-12 mx-auto mb-2 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
                    activo 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                      : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                  }`}
                >
                  <FileText size={18} />
                </button>
              )
            }
            return (
              <div
                key={doc.id}
                onClick={() => onSeleccionarDocumento(doc)}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl mb-1 cursor-pointer transition-all duration-200 ${
                  activo 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-bg border border-transparent'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  activo ? 'bg-primary/20' : 'bg-bg'
                }`}>
                  <FileText size={16} className={activo ? 'text-primary' : 'text-text-secondary'} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium truncate ${activo ? 'text-primary' : 'text-text-primary'}`}>
                    {doc.filename}
                  </p>
                  <p className="text-[11px] text-text-secondary/60">
                    Documento
                  </p>
                </div>

                <button
                  onClick={(e) => manejarEliminar(e, doc.id)}
                  className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer ${
                    activo 
                      ? 'hover:bg-primary/20 text-primary' 
                      : 'hover:bg-error/10 text-text-secondary hover:text-error'
                  }`}
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

      {/* Footer con Usuario y Acciones */}
      <div className="p-3 shrink-0 border-t border-border/30">
        {!colapsado && (
          <div className="flex items-center gap-2 pb-3 mb-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg transition-colors cursor-pointer">
              <HelpCircle size={14} />
              <span>Ayuda</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[12px] font-medium text-text-secondary hover:text-text-primary hover:bg-bg transition-colors cursor-pointer">
              <Settings size={14} />
              <span>Config</span>
            </button>
          </div>
        )}
        
        {colapsado ? (
           <button 
             onClick={manejarCerrarSesion}
             className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-text-secondary hover:bg-error/10 hover:text-error transition-all duration-200 cursor-pointer"
             title="Cerrar sesión"
           >
             <LogOut size={18} />
           </button>
        ) : (
          <div 
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-bg cursor-pointer transition-all duration-200 group"
            onClick={manejarCerrarSesion}
          >
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-semibold text-[14px] shrink-0">
                {usuario?.email?.[0]?.toUpperCase() || 'U'}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-[13px] font-semibold truncate text-text-primary">
                 {usuario?.email?.split('@')[0] || 'Usuario'}
               </p>
               <p className="text-[11px] text-text-secondary/60 truncate">
                 {usuario?.email || 'usuario@ejemplo.com'}
               </p>
             </div>
             <LogOut size={16} className="text-text-secondary/40 group-hover:text-error transition-colors" />
          </div>
        )}
      </div>
    </aside>
  )
}
