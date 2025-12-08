-- Storage Policies for wish-list-images bucket
-- Run this in Supabase SQL Editor to create the storage policies

-- Policy 1: Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'wish-list-images' AND
  auth.role() = 'authenticated'
);

-- Policy 2: Allow public read access to files
CREATE POLICY "Allow public reads"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'wish-list-images'
);

-- Policy 3: Allow users to update their own files
CREATE POLICY "Allow users to update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'wish-list-images' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'wish-list-images' AND
  auth.role() = 'authenticated'
);

-- Policy 4: Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'wish-list-images' AND
  auth.role() = 'authenticated'
);

