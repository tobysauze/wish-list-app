-- Fix the INSERT policy for wish_list_items
-- This ensures authenticated users can create items

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can create items" ON public.wish_list_items;

-- Create the fixed policy
CREATE POLICY "Authenticated users can create items" ON public.wish_list_items
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

