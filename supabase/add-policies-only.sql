-- Add Policies Only - Use this if tables already exist
-- This will add/update policies without dropping tables

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wish_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wish_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view wish lists" ON public.wish_lists;
DROP POLICY IF EXISTS "Users can manage own wish list" ON public.wish_lists;
DROP POLICY IF EXISTS "Authenticated users can view wish list items" ON public.wish_list_items;
DROP POLICY IF EXISTS "Authenticated users can create items" ON public.wish_list_items;
DROP POLICY IF EXISTS "Users can manage own items" ON public.wish_list_items;
DROP POLICY IF EXISTS "Users can delete own items" ON public.wish_list_items;
DROP POLICY IF EXISTS "Authenticated users can view purchases" ON public.purchases;
DROP POLICY IF EXISTS "Authenticated users can create purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can view own saved users" ON public.saved_users;
DROP POLICY IF EXISTS "Users can save other users" ON public.saved_users;
DROP POLICY IF EXISTS "Users can unsave users" ON public.saved_users;
DROP POLICY IF EXISTS "Anyone can view affiliate links" ON public.affiliate_links;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Wish Lists policies
CREATE POLICY "Authenticated users can view wish lists" ON public.wish_lists
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage own wish list" ON public.wish_lists
  FOR ALL USING (auth.uid() = user_id);

-- Wish List Items policies
CREATE POLICY "Authenticated users can view wish list items" ON public.wish_list_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create items" ON public.wish_list_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can manage own items" ON public.wish_list_items
  FOR UPDATE USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can delete own items" ON public.wish_list_items
  FOR DELETE USING (auth.uid() = creator_id);

-- Purchases policies
CREATE POLICY "Authenticated users can view purchases" ON public.purchases
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete own purchases" ON public.purchases
  FOR DELETE USING (auth.uid() = purchaser_id);

-- Saved Users policies
CREATE POLICY "Users can view own saved users" ON public.saved_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save other users" ON public.saved_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave users" ON public.saved_users
  FOR DELETE USING (auth.uid() = user_id);

-- Affiliate Links policies
CREATE POLICY "Anyone can view affiliate links" ON public.affiliate_links
  FOR SELECT USING (true);


