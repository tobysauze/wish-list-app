-- Fix RLS Policies for Wish List Items
-- Run this in your Supabase SQL Editor if you're getting "new row violates row-level security policy" errors

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create items" ON public.wish_list_items;

-- Create a more permissive INSERT policy
-- This allows authenticated users to add items to any wish list
-- (needed for secret items feature where friends can add items)
CREATE POLICY "Authenticated users can create items" ON public.wish_list_items
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Also ensure the UPDATE policy allows users to update items they created
DROP POLICY IF EXISTS "Users can manage own items" ON public.wish_list_items;

CREATE POLICY "Users can manage own items" ON public.wish_list_items
  FOR UPDATE 
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

