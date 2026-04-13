/**
 * Barra lateral del chat.
 * Muestra la lista de documentos, botón de subida, e info del usuario.
 */
import { useState, useEffect, useCallback } from 'react'
import {
  FileText, Upload, Trash2, LogOut, Plus,
  ChevronLeft, ChevronRight, Loader2, AlertCircle, Search, Edit
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
    <div className={`flex flex-col h-full bg-surface transition-all duration-300 ease-in-out relative ${colapsada ? 'w-16' : 'w-64 md:w-72'}`}>
      
      {/* Header Superior - Muy simple */}
      <div className="h-14 flex items-center justify-between px-3 shrink-0">
        {!colapsada && (
          <div className="flex items-center gap-2 overflow-hidden px-2 opacity-90 cursor-default">
             <div className="w-7 h-7 rounded-full bg-text-primary text-bg flex items-center justify-center font-bold text-sm">
               P
             </div>
             <span className="font-semibold text-[15px] font-sans tracking-tight text-text-primary">PetroChat</span>
          </div>
        )}
        <button 
          onClick={() => setColapsada(!colapsada)}
          className={`p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg transition-colors ${colapsada ? 'mx-auto' : ''}`}
          title={colapsada ? "Expandir" : "Contraer"}
        >
          {colapsada ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Acción Nuevo / Subir Documento (Estilo "Nuevo chat") */}
      <div className="px-3 pt-2 pb-4">
        {colapsada ? (
          <button 
            onClick={() => { setColapsada(false); setMostrarUpload(true) }}
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg hover:bg-bg transition-colors text-text-primary"
            title="Nuevo chat documental"
          >
            <Edit size={18} />
          </button>
        ) : (
          <button 
            onClick={() => setMostrarUpload(!mostrarUpload)}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-[14px] font-medium text-text-primary hover:bg-bg transition-colors"
          >
            <Edit size={18} className="text-text-secondary" />
            <span>Subir Documento</span>
          </button>
        )}
      </div>

      {/* Upload Panel Abierto */}
      {!colapsada && mostrarUpload && (
        <div className="px-3 pb-4">
          <FileUpload
            onDocumentoSubido={manejarDocumentoSubido}
            onCerrar={() => setMostrarUpload(false)}
          />
        </div>
      )}

      {/* Buscador Muy Limpio */}
      {!colapsada && (
        <div className="px-3 pb-3">
          <div className="relative group flex items-center px-3 py-2 rounded-lg bg-bg">
            <Search size={16} className="text-text-secondary mr-2" />
            <input 
              type="text" 
              placeholder="Buscar archivo... " 
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full bg-transparent border-none text-[13px] text-text-primary outline-none placeholder:text-text-secondary/70"
            />
          </div>
        </div>
      )}

      {/* Lista de Documentos Estilo Chat History */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {!colapsada && documentosFiltrados.length > 0 && (
          <p className="text-[12px] font-semibold px-3 py-2 text-text-secondary/70">
            Documentos Recientes
          </p>
        )}

        {error && !colapsada && (
          <div className="flex items-center gap-2 px-3 py-2 mx-1 rounded-lg text-error text-[12px]">
             <AlertCircle size={14}/> <span>{error}</span>
          </div>
        )}

        {cargando ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={18} className="animate-spin text-text-secondary" />
          </div>
        ) : documentosFiltrados.length === 0 ? (
          !colapsada && (
            <div className="px-3 py-4 text-[13px] text-text-secondary font-medium">
              No tienes documentos.
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
                  className={`w-10 h-10 mx-auto flex items-center justify-center rounded-lg transition-all ${activo ? 'bg-bg text-text-primary' : 'text-text-secondary hover:bg-bg hover:text-text-primary'}`}
                >
                  <FileText size={16} />
                </button>
              )
            }
            return (
              <div
                key={doc.id}
                onClick={() => onSeleccionarDocumento(doc)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${activo ? 'bg-bg' : 'hover:bg-bg hover:bg-opacity-50'}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                   <FileText size={16} className={activo ? 'text-text-primary' : 'text-text-secondary'} />
                   <span className={`text-[14px] truncate ${activo ? 'text-text-primary font-medium' : 'text-text-primary/90'}`}>
                     {doc.filename}
                   </span>
                </div>
                <button
                  onClick={(e) => manejarEliminar(e, doc.id)}
                  className="ml-2 text-text-secondary opacity-0 group-hover:opacity-100 hover:text-error transition-all"
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

      {/* Footer Usuario Planean y Limpio */}
      <div className="p-3 shrink-0">
        {colapsada ? (
           <button onClick={manejarCerrarSesion}
                   className="w-10 h-10 mx-auto rounded-lg flex items-center justify-center text-text-secondary hover:bg-bg hover:text-text-primary transition-colors"
                   title="Cerrar sesión">
             <LogOut size={18} />
           </button>
        ) : (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-bg cursor-pointer transition-colors group" onClick={manejarCerrarSesion}>
             <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-text-secondary/20 flex items-center justify-center text-text-primary font-medium text-[13px]">
                   {usuario?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-[14px] font-medium truncate text-text-primary">
                  {usuario?.email?.split('@')[0] || 'Usuario'}
                </span>
             </div>
             <LogOut size={16} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>
    </div>
  )
}
