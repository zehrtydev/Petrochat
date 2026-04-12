import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  procesarStream,
  subirDocumento,
  obtenerDocumentos,
  eliminarDocumento,
} from '../services/api'

describe('API Service', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  describe('subirDocumento', () => {
    it('sends file with auth header', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ document_id: '123' }),
      })

      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      
      await subirDocumento(file, 'test-token')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/subir'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      )
    })
  })

  describe('obtenerDocumentos', () => {
    it('fetches documents with auth', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([{ id: '1', filename: 'test.pdf' }]),
      })

      const result = await obtenerDocumentos('test-token')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/documentos'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      )
      expect(result).toHaveLength(1)
    })
  })

  describe('eliminarDocumento', () => {
    it('deletes document with auth', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })

      await eliminarDocumento('doc-123', 'test-token')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/documentos/doc-123'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
          }),
        })
      )
    })
  })
})
