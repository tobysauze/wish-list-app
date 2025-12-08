-- Price Comparisons table
-- Stores price data from different retailers for wish list items
CREATE TABLE IF NOT EXISTS public.price_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.wish_list_items(id) ON DELETE CASCADE,
  retailer TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  product_url TEXT NOT NULL,
  product_title TEXT,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(item_id, retailer, product_url)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_comparisons_item_id ON public.price_comparisons(item_id);
CREATE INDEX IF NOT EXISTS idx_price_comparisons_price ON public.price_comparisons(item_id, price);
CREATE INDEX IF NOT EXISTS idx_price_comparisons_last_updated ON public.price_comparisons(last_updated);

-- RLS Policies
ALTER TABLE public.price_comparisons ENABLE ROW LEVEL SECURITY;

-- Anyone can view price comparisons (they're public data)
CREATE POLICY "Anyone can view price comparisons" ON public.price_comparisons
  FOR SELECT USING (true);

-- Only authenticated users can insert price comparisons (via API)
CREATE POLICY "Authenticated users can create price comparisons" ON public.price_comparisons
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only authenticated users can update price comparisons
CREATE POLICY "Authenticated users can update price comparisons" ON public.price_comparisons
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow deletion (for cleanup)
CREATE POLICY "Authenticated users can delete price comparisons" ON public.price_comparisons
  FOR DELETE USING (auth.uid() IS NOT NULL);

