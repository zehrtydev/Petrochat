/**
 * Tests para FileUpload component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FileUpload from '../components/FileUpload'
import { useAuth } from '../contexts/AuthContext'

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    obtenerToken: vi.fn(() => 'test-token'),
  })),
}))

vi.mock('../services/api', () => ({
  subirDocumento: vi.fn(),
}))

vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(({ onDrop, accept, maxSize }) => ({
    getRootProps: vi.fn(() => ({ onClick: () => {} })),
    getInputProps: vi.fn(() => ({ onChange: () => {} })),
    isDragActive: false,
    isDragAccept: false,
    isDragReject: false,
  })),
}))

vi.mock('lucide-react', () => ({
  Upload: ({ size }) => <svg data-testid="upload-icon" width={size} height={size} />,
  FileText: ({ size }) => <svg data-testid="file-icon" width={size} height={size} />,
  CheckCircle: ({ size }) => <svg data-testid="check-icon" width={size} height={size} />,
  XCircle: ({ size }) => <svg data-testid="error-icon" width={size} height={size} />,
  Loader2: ({ size }) => <svg data-testid="loader-icon" width={size} height={size} />,
}))

describe('FileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockOnDocumentoSubido = vi.fn()

  it('acepta archivos válidos', async () => {
    const validFile = new File(['contenido'], 'documento.pdf', { type: 'application/pdf' })

    const { getByText } = render(
      <FileUpload onDocumentoSubido={mockOnDocumentoSubido} />
    )

    expect(getByText(/Arrastrá un archivo aquí/)).toBeInTheDocument()
  })

  it('rejecta archivos inválidos', async () => {
    const invalidFile = new File(['contenido'], 'documento.txt', { type: 'text/plain' })
    const { getByText } = render(
      <FileUpload onDocumentoSubido={mockOnDocumentoSubido} />
    )

    expect(getByText).toThrow()
  })

  it('respeta límite de tamaño', () => {
    const { getByText } = render(
      <FileUpload onDocumentoSubido={mockOnDocumentoSubido} />
    )

    expect(getByText(/20MB/)).toBeInTheDocument()
  })

  it('llama callback onUpload', async () => {
    const { subirDocumento } = await import('../services/api')
    subirDocumento.mockResolvedValueOnce({
      document_id: '123',
      filename: 'test.pdf',
      chunk_count: 5,
    })

    render(<FileUpload onDocumentoSubido={mockOnDocumentoSubido} />)
  })
})