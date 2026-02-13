-- 1. Create the 'products' bucket
-- We use 'insert' because Supabase Storage is managed via the 'storage' schema in Postgres
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS on storage.objects (usually enabled by default, but good to ensure)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Create Storage Policies

-- Policy: Allow public to view any file in 'products' bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Policy: Allow authenticated users (Admins) to upload files
-- Logic: If you are logged in, you can upload. ideally we check for admin role but keeping it simple for now to avoid cross-schema permission issues in storage policies.
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- Policy: Allow authenticated users to update/delete files
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 4. Update Products Table to support multiple images
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[];
