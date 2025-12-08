# Debugging Unpurchase Feature

## Step 1: Check Browser Console

1. Open browser console (F12 → Console tab)
2. Click "Unmark as Purchased" button
3. Look for these messages:
   - "Calling unpurchase API: /lists/..."
   - "Response status: ..."
   - Any error messages

## Step 2: Verify DELETE Policy Exists

Run this in Supabase SQL Editor to check if the policy exists:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'purchases' AND cmd = 'DELETE';
```

If no results, run this to add it:

```sql
CREATE POLICY "Users can delete own purchases" ON public.purchases
  FOR DELETE USING (auth.uid() = purchaser_id);
```

## Step 3: Check Network Tab

1. Open browser DevTools → Network tab
2. Click "Unmark as Purchased"
3. Look for the request to `/lists/.../unpurchase/...`
4. Check the response status and body

## Common Issues:

1. **403 Forbidden**: DELETE policy not set up - run the SQL above
2. **404 Not Found**: Purchase record doesn't exist or route path is wrong
3. **401 Unauthorized**: User not logged in
4. **No response**: Route file might not be in the correct location

## Quick Fix SQL:

Run this in Supabase SQL Editor:

```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can delete own purchases" ON public.purchases;

-- Create the DELETE policy
CREATE POLICY "Users can delete own purchases" ON public.purchases
  FOR DELETE USING (auth.uid() = purchaser_id);
```

