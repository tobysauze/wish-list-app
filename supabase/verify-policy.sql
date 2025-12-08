-- Verify and fix the INSERT policy for wish_list_items
-- Run this to check and recreate the policy if needed

-- First, let's see what policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'wish_list_items';

-- Drop and recreate the INSERT policy to ensure it's correct
DROP POLICY IF EXISTS "Authenticated users can create items" ON public.wish_list_items;

CREATE POLICY "Authenticated users can create items" ON public.wish_list_items
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Verify it was created
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'wish_list_items' AND cmd = 'INSERT';

