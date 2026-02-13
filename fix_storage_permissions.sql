-- Este script corrige tus permisos de almacenamiento de forma segura
-- Ejecuta esto en el editor SQL de Supabase para arreglar el error 42501

-- 1. Crear el bucket 'products' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar políticas antiguas para evitar duplicados
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- 3. Crear nuevas políticas (simplificadas para que funcionen)

-- Permitir a CUALQUIERA ver las imágenes (importante para que se vean en la tienda)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Permitir a usuarios AUTENTICADOS subir imágenes
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Permitir a usuarios AUTENTICADOS actualizar sus imágenes
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Permitir a usuarios AUTENTICADOS borrar imágenes
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 4. Agregar la columna 'images' a la tabla de productos si no existe
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[];
