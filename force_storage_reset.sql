-- FORCE STORAGE RESET & CONFIGURATION
-- Run this script to manually fix the storage bucket and permissions.

-- 1. Try to create the 'products' bucket directly
-- We use an INSERT statement which bypasses the dashboard UI.
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. RESET POLICIES (Delete all old ones to start fresh)
DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Products" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Products" ON storage.objects;
-- Also drop potential legacy policy names
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

-- 3. APPLY PERMISSIVE POLICIES
-- NOTE: These policies are deliberately simple to get it working first.

-- ALLOW PUBLIC READ (Essential for viewing images)
CREATE POLICY "Public Access Products"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- ALLOW AUTHENTICATED UPLOAD
-- Any logged-in user can upload.
CREATE POLICY "Auth Upload Products"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- ALLOW AUTHENTICATED UPDATE
CREATE POLICY "Auth Update Products"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- ALLOW AUTHENTICATED DELETE
CREATE POLICY "Auth Delete Products"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 4. VERIFY
-- This query will show you if the bucket exists after running the script.
SELECT * FROM storage.buckets WHERE id = 'products';
