/**
 * Componente de subida de archivos con drag & drop.
 * Acepta PDF y DOCX, muestra progreso de subida.
 */

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { subirDocumento } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function FileUpload({ onDocumentoSubido, onCerrar }) {
  const { obtenerToken } = useAuth()
  const [subiendo, setSubiendo] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  async function manejarArchivo(archivosAceptados) {
    if (archivosAceptados.length === 0) return

    const archivo = archivosAceptados[0]
    setSubiendo(true)
    setError('')
    setResultado(null)

    try {
      const token = await obtenerToken()
      const respuesta = await subirDocumento(archivo, token)
      setResultado(respuesta)

      if (onDocumentoSubido) {
        onDocumentoSubido(respuesta)
      }
    } catch (err) {
      setError(err.message || 'Error al subir el archivo')
    } finally {
      setSubiendo(false)
    }
  }

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop: manejarArchivo,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, /* 20MB */
    disabled: subiendo,
  })

  let claseDropzone = 'flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl transition-all cursor-pointer bg-surface/50 shadow-sm'
  if (isDragActive) claseDropzone += ' border-secondary bg-secondary/5 scale-[1.02]'
  else claseDropzone += ' border-border hover:border-secondary/50 hover:bg-surface'
  if (isDragAccept) claseDropzone += ' !border-success !bg-success/5'
  if (isDragReject) claseDropzone += ' !border-error !bg-error/5'

  return (
    <div className="animate-fade-in group w-full py-2">
      {/* Zona de arrastrar y soltar */}
      <div {...getRootProps()} className={claseDropzone}>
        <input {...getInputProps()} />

        {subiendo ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 size={36} className="animate-spin text-secondary" />
            <div className="text-center">
              <p className="text-[13px] font-semibold text-text-primary">Procesando documento...</p>
              <p className="text-[11px] text-text-secondary mt-1 max-w-[200px] leading-relaxed">Extrayendo texto y metadatos relevantes para IA</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-surface shadow-sm border border-border flex items-center justify-center group-hover:scale-110 group-hover:text-secondary transition-all">
               <Upload size={24} className="text-text-secondary transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-text-primary">
                {isDragActive
                  ? 'Suelta el archivo para cargarlo'
                  : 'Arrastra un archivo o haz clic'}
              </p>
              <p className="text-[11px] mt-1.5 text-text-secondary font-medium">
                Soporta PDF, DOCX • Máximo 20MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resultado exitoso */}
      {resultado && (
        <div className="mt-4 p-3 rounded-xl flex items-start gap-3 animate-fade-in bg-success/10 border border-success/20">
          <CheckCircle size={18} className="text-success mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-success tracking-tight">¡Documento procesado!</p>
            <div className="flex items-center gap-1.5 mt-1">
              <FileText size={12} className="text-text-secondary flex-shrink-0" />
              <span className="text-[11px] text-text-secondary truncate">
                {resultado.filename} • {resultado.chunk_count} fragmentos lógicos
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-xl flex items-start gap-3 animate-fade-in bg-error/10 border border-error/20">
          <XCircle size={18} className="text-error mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-error tracking-tight">Error de carga</p>
            <p className="text-[11px] text-text-secondary mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Botón cerrar */}
      {onCerrar && (
        <button onClick={onCerrar} className="btn-ghost w-full justify-center mt-4 text-[13px] opacity-80 hover:opacity-100">
          Cancelar subida
        </button>
      )}
    </div>
  )
}
