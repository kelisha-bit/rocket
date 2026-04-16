-- =====================================================
-- Setup Member Photos Storage Bucket in Supabase
-- =====================================================
-- Run this SQL in the Supabase SQL Editor to create
-- the storage bucket for member profile photos
-- =====================================================

-- Create the storage bucket for member photos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'member-photos',
  'member-photos',
  true,
  5242880  -- 5MB limit
) ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload member photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to member photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update member photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete member photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to upload member photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anyone to view member photos" ON storage.objects;

-- Create policy to allow anyone to upload photos (using anon key)
CREATE POLICY "Allow anyone to upload member photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'member-photos');

-- Create policy to allow anyone to view member photos (public bucket)
CREATE POLICY "Allow anyone to view member photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'member-photos');

-- Create policy to allow anyone to update photos
CREATE POLICY "Allow anyone to update member photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'member-photos')
WITH CHECK (bucket_id = 'member-photos');

-- Create policy to allow anyone to delete photos
CREATE POLICY "Allow anyone to delete member photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'member-photos');

-- =====================================================
-- Verification Query
-- =====================================================
-- Run this to verify the bucket was created:
-- SELECT * FROM storage.buckets WHERE id = 'member-photos';
-- 
-- Run this to verify policies:
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%member photos%';
