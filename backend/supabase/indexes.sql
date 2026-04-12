-- Índices para optimizar queries de PetroChat
-- Ejecutar en el SQL Editor de Supabase

-- Índices para la tabla documents
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_created ON documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status) WHERE status = 'processing';

-- Índices para seguridad RLS (Row Level Security)
CREATE INDEX IF NOT EXISTS idx_documents_user_id_rls ON documents(user_id) INCLUDE (id, filename, status);

-- Índices para Pinecone (cache de queries frecuentes)
-- Índice compuesto para filtrar por usuario y documento
CREATE INDEX IF NOT EXISTS idx_documents_user_id_id ON documents (user_id, id);

-- Función para limpiar documentos huérfanos (con status 'processing' por más de 1 hora)
CREATE OR REPLACE FUNCTION limpiar_documentos_pendientes()
RETURNS void AS $$
BEGIN
  UPDATE documents
  SET status = 'error'
  WHERE status = 'processing'
    AND created_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Trigger para automáticamente limpiar documentos pendientes
CREATE OR REPLACE FUNCTION trigger_limpiar_pendientes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'processing' AND NEW.created_at < NOW() - INTERVAL '1 hour' THEN
    NEW.status = 'error';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Nota: Descomenta la siguiente línea si quieres el trigger automático
-- CREATE TRIGGER limpiar_documentos_pendientes_trigger
--   BEFORE UPDATE ON documents
--   FOR EACH ROW
--   EXECUTE FUNCTION trigger_limpiar_pendientes();
