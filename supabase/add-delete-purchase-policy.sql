-- Add DELETE policy for purchases
-- Users should be able to delete purchases they created

DROP POLICY IF EXISTS "Users can delete own purchases" ON public.purchases;

CREATE POLICY "Users can delete own purchases" ON public.purchases
  FOR DELETE
  USING (auth.uid() = purchaser_id);

