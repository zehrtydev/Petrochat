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
      const token = obtenerToken()
      const respuesta = await subirDocumento(archivo, token)
      setResultado(respuesta)

      /* Notificar al componente padre que se subió un documento */
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

  /* Determinar clase CSS del dropzone según estado */
  let claseDropzone = 'dropzone'
  if (isDragActive) claseDropzone += ' dropzone-active'
  if (isDragAccept) claseDropzone += ' dropzone-accept'
  if (isDragReject) claseDropzone += ' dropzone-reject'

  return (
    <div className="animate-fade-in">
      {/* Zona de arrastrar y soltar */}
      <div {...getRootProps()} className={claseDropzone}>
        <input {...getInputProps()} />

        {subiendo ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-secondary)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Procesando documento...
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Extrayendo texto, generando fragmentos y embeddings
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <Upload size={40} style={{ color: 'var(--color-primary-light)' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {isDragActive
                  ? 'Soltá el archivo aquí'
                  : 'Arrastrá un archivo aquí o hacé clic para seleccionar'}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                PDF o DOCX • Máximo 20MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Resultado exitoso */}
      {resultado && (
        <div className="mt-4 p-4 rounded-xl flex items-start gap-3 animate-fade-in"
             style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <CheckCircle size={20} style={{ color: 'var(--color-success)' }} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
              ¡Documento procesado!
            </p>
            <div className="flex items-center gap-2 mt-1">
              <FileText size={14} style={{ color: 'var(--color-text-secondary)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                {resultado.filename} • {resultado.chunk_count} fragmentos generados
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl flex items-start gap-3 animate-fade-in"
             style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <XCircle size={20} style={{ color: 'var(--color-error)' }} className="mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-error)' }}>
              Error al subir
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Botón cerrar */}
      {onCerrar && (
        <button onClick={onCerrar}
                className="btn-ghost w-full justify-center mt-4 text-sm">
          Cerrar
        </button>
      )}
    </div>
  )
}
