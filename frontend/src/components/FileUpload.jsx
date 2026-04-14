/**
 * Componente de subida de archivos premium con drag & drop.
 * Acepta PDF y DOCX, muestra progreso de subida.
 */

import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, XCircle, Loader2, File } from 'lucide-react'
import { subirDocumento } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function FileUpload({ onDocumentoSubido, onCerrar }) {
  const { obtenerToken } = useAuth()
  const [subiendo, setSubiendo] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState(null)
  const [archivoPreview, setArchivoPreview] = useState(null)

  async function manejarArchivo(archivosAceptados) {
    if (archivosAceptados.length === 0) return

    const archivo = archivosAceptados[0]
    setSubiendo(true)
    setError(null)
    setResultado(null)
    setArchivoPreview(archivo)

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
    maxSize: 20 * 1024 * 1024,
    disabled: subiendo,
  })

  let dropzoneClasses = 'flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer bg-bg/50'
  
  if (isDragActive) {
    dropzoneClasses += ' border-secondary bg-secondary/5 scale-[1.01]'
  } else if (isDragAccept) {
    dropzoneClasses += ' border-success bg-success/5'
  } else if (isDragReject) {
    dropzoneClasses += ' border-error bg-error/5'
  } else {
    dropzoneClasses += ' border-border hover:border-primary/50 hover:bg-surface'
  }

  return (
    <div className="animate-slide-up w-full">
      {/* Zona de arrastrar y soltar */}
      <div {...getRootProps()} className={dropzoneClasses}>
        <input {...getInputProps()} />

        {subiendo ? (
          <div className="flex flex-col items-center gap-4 py-4">
            {/* File Preview */}
            {archivoPreview && (
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileText size={28} className="text-primary" />
              </div>
            )}
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-secondary" />
              <span className="text-[13px] font-medium text-text-primary">Procesando...</span>
            </div>
            <p className="text-[11px] text-text-secondary text-center max-w-[200px]">
              Extrayendo texto y preparando para IA
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            {/* Upload Icon Container */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
              isDragActive ? 'bg-secondary/20' : 'bg-surface border border-border shadow-sm'
            }`}>
              <Upload size={24} className={isDragActive ? 'text-secondary' : 'text-text-secondary'} />
            </div>
            
            <div className="text-center">
              <p className="text-[14px] font-semibold text-text-primary">
                {isDragActive
                  ? 'Suelta para cargar'
                  : 'Arrastra tu archivo aquí'}
              </p>
              <p className="text-[12px] mt-2 text-text-secondary">
                o <span className="text-primary font-medium">busca en tu dispositivo</span>
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-bg text-[11px] font-medium text-text-secondary">
                  <File size={12} /> PDF
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-bg text-[11px] font-medium text-text-secondary">
                  <File size={12} /> DOCX
                </span>
                <span className="text-[11px] text-text-secondary/60">máx. 20MB</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultado exitoso */}
      {resultado && (
        <div className="mt-4 p-4 rounded-xl flex items-start gap-3 animate-fade-in bg-success/10 border border-success/20">
          <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-success" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-success">¡Documento listo!</p>
            <div className="flex items-center gap-2 mt-1">
              <FileText size={12} className="text-text-secondary flex-shrink-0" />
              <span className="text-[12px] text-text-secondary truncate">
                {resultado.filename}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary/70 mt-0.5">
              {resultado.chunk_count} fragmentos procesados
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl flex items-start gap-3 animate-fade-in bg-error/10 border border-error/20">
          <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center flex-shrink-0">
            <XCircle size={20} className="text-error" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-error">Error de carga</p>
            <p className="text-[12px] text-text-secondary mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Botón cerrar */}
      {onCerrar && !resultado && (
        <button 
          onClick={onCerrar} 
          className="w-full justify-center mt-4 py-2.5 px-4 rounded-xl text-[13px] font-medium text-text-secondary bg-bg hover:bg-surface border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer"
        >
          Cancelar
        </button>
      )}
    </div>
  )
}
