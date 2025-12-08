-- Safe Schema Setup - Handles existing tables
-- This version can be run multiple times without errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS public.purchases CASCADE;
DROP TABLE IF EXISTS public.wish_list_items CASCADE;
DROP TABLE IF EXISTS public.saved_users CASCADE;
DROP TABLE IF EXISTS public.wish_lists CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.affiliate_links CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Wish Lists table
CREATE TABLE public.wish_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'My Wish List',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id)
);

-- Wish List Items table
CREATE TABLE public.wish_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wish_list_id UUID NOT NULL REFERENCES public.wish_lists(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  affiliate_link TEXT,
  is_hidden_from_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Purchases table
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.wish_list_items(id) ON DELETE CASCADE,
  purchaser_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(item_id)
);

-- Saved Users table
CREATE TABLE public.saved_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  saved_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, saved_user_id),
  CHECK (user_id != saved_user_id)
);

-- Affiliate Links table
CREATE TABLE public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_url TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(original_url)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_wish_lists_user_id ON public.wish_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_wish_list_items_wish_list_id ON public.wish_list_items(wish_list_id);
CREATE INDEX IF NOT EXISTS idx_wish_list_items_creator_id ON public.wish_list_items(creator_id);
CREATE INDEX IF NOT EXISTS idx_purchases_item_id ON public.purchases(item_id);
CREATE INDEX IF NOT EXISTS idx_purchases_purchaser_id ON public.purchases(purchaser_id);
CREATE INDEX IF NOT EXISTS idx_saved_users_user_id ON public.saved_users(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_users_saved_user_id ON public.saved_users(saved_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wish_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wish_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

-- Function to automatically create a wish list when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  
  INSERT INTO public.wish_lists (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_wish_lists_updated_at ON public.wish_lists;
DROP TRIGGER IF EXISTS update_wish_list_items_updated_at ON public.wish_list_items;

-- Trigger to create user profile and wish list on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wish_lists_updated_at BEFORE UPDATE ON public.wish_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wish_list_items_updated_at BEFORE UPDATE ON public.wish_list_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


