-- Fix missing users in the users table
-- This will create user records for any auth users that don't have a profile yet

-- Insert users from auth.users that don't exist in public.users
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'User', au.email),
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Create wish lists for users that don't have one
INSERT INTO public.wish_lists (user_id, title, created_at, updated_at)
SELECT 
  u.id,
  'My Wish List',
  u.created_at,
  NOW()
FROM public.users u
LEFT JOIN public.wish_lists wl ON u.id = wl.user_id
WHERE wl.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

