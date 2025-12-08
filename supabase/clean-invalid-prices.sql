-- Clean up invalid/placeholder prices from the database
-- Run this in Supabase SQL Editor to remove all placeholder prices

DELETE FROM public.price_comparisons
WHERE 
  price >= 100000 
  OR price = 999999 
  OR price < 0.01;

-- This will remove all invalid prices that may have been cached

