# How to Check RLS Policies in Supabase

## Important: Two Different Types of Policies

Supabase has two different policy sections:

1. **Authentication Policies** (what you're currently viewing)
   - Location: Authentication → Policies
   - These are for auth rules, NOT database RLS

2. **Row Level Security (RLS) Policies** (what you need)
   - Location: Table Editor → [table name] → Policies tab
   - These control who can read/write to your database tables

## Steps to Check RLS Policies:

1. In Supabase dashboard, click **"Table Editor"** in the left sidebar (NOT Authentication)
2. Click on the **`wish_list_items`** table
3. Click the **"Policies"** tab at the top
4. You should see policies listed there

## If Policies Are Missing:

If you don't see policies in the Table Editor → Policies tab, run the SQL:

1. Go to **SQL Editor**
2. Copy and paste the contents of `supabase/add-policies-only.sql`
3. Click **"Run"**

## Verify the Policy is Correct:

The INSERT policy should say:
- **Name**: "Authenticated users can create items"
- **Command**: INSERT
- **Definition**: Should check `auth.uid() IS NOT NULL`

If it's checking `auth.role() = 'authenticated'` instead, that might be the issue.

