-- ================================================
-- POLICIES RLS PARA PETROCHAT
-- Ejecutar en SQL Editor de Supabase
-- ================================================

-- Habilitar RLS en la tabla documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ================================================
-- POLICIES DE LECTURA (SELECT)
-- ================================================

-- Users can only read their own documents
CREATE POLICY "Users can view own documents"
ON documents
FOR SELECT
USING (auth.uid() = user_id);

-- ================================================
-- POLICIES DE INSERCIÓN (INSERT)
-- ================================================

-- Users can insert documents with their own user_id
CREATE POLICY "Users can insert own documents"
ON documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ================================================
-- POLICIES DE ACTUALIZACIÓN (UPDATE)
-- ================================================

-- Users can only update their own documents
CREATE POLICY "Users can update own documents"
ON documents
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================
-- POLICIES DE ELIMINACIÓN (DELETE)
-- ================================================

-- Users can only delete their own documents
CREATE POLICY "Users can delete own documents"
ON documents
FOR DELETE
USING (auth.uid() = user_id);

-- ================================================
-- STORAGE POLICIES
-- ================================================

-- Enable RLS on storage buckets
-- Note: You need to do this via Supabase Dashboard or API

-- Allow users to upload files to their own folder
CREATE POLICY "Users can upload own files"
ON storage.objects
FOR INSERT
WITH CHECK (
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own files
CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
USING (
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
USING (
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
USING (
    auth.uid()::text = (storage.foldername(name))[1]
);
