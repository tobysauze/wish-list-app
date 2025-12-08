# Complete Supabase Setup Guide

## Step 1: Create Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (or create a free account)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `wish-list-app` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to you
4. Click **"Create new project"** and wait ~2 minutes for it to finish

## Step 2: Get Your API Credentials

1. In your project dashboard, click **Settings** (gear icon) in the left sidebar
2. Click **API** under "Project Settings"
3. Copy these two values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys" → "anon public")
4. Add them to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Set Up the Database Schema

1. In Supabase dashboard, click **SQL Editor** in the left sidebar
2. Click **"New Query"** button (top right)
3. Open the file `supabase/schema.sql` from your project
4. Copy **ALL** the contents of that file
5. Paste it into the SQL Editor
6. Click **"Run"** button (or press `Cmd+Enter` / `Ctrl+Enter`)
7. You should see "Success. No rows returned" - this means it worked!

## Step 4: Verify Tables Were Created

1. Click **Table Editor** in the left sidebar
2. You should see these tables:
   - `users`
   - `wish_lists`
   - `wish_list_items`
   - `purchases`
   - `saved_users`
   - `affiliate_links`

## Step 5: Verify RLS Policies Are Set Up

1. Click on any table (e.g., `wish_list_items`)
2. Click the **"Policies"** tab at the top
3. You should see policies listed like:
   - "Authenticated users can view wish list items"
   - "Authenticated users can create items"
   - etc.

If you don't see policies, go back to Step 3 and make sure you ran the entire SQL file.

## Step 6: Set Up Storage (for Images)

### Create the Storage Bucket

1. Click **Storage** in the left sidebar
2. Click **"New bucket"**
3. Fill in:
   - **Name**: `wish-list-images` (must be exactly this)
   - **Public bucket**: ✅ **Check this box** (very important!)
4. Click **"Create bucket"**

### Set Up Storage Policies

1. Click on the `wish-list-images` bucket
2. Click the **"Policies"** tab
3. Click **"New Policy"**

#### Policy 1: Allow Uploads
- Click **"For full customization"**
- **Policy name**: `Allow authenticated uploads`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  (bucket_id = 'wish-list-images'::text) AND (auth.role() = 'authenticated'::text)
  ```
- Click **"Review"** then **"Save policy"**

#### Policy 2: Allow Public Reads
- Click **"New Policy"** again
- Click **"For full customization"**
- **Policy name**: `Allow public reads`
- **Allowed operation**: `SELECT`
- **Policy definition**:
  ```sql
  (bucket_id = 'wish-list-images'::text)
  ```
- Click **"Review"** then **"Save policy"**

## Step 7: Test Your Setup

1. Restart your Next.js dev server:
   ```bash
   npm run dev
   ```
2. Go to your app and try to:
   - Sign up for an account
   - Add an item to your wish list
   - Upload an image (optional)

## Troubleshooting

### "new row violates row-level security policy"
- Make sure you ran the entire `schema.sql` file in Step 3
- Check that policies exist in the **Policies** tab for each table
- Try running the fix from `supabase/fix_rls_policies.sql` if needed

### "Bucket not found"
- Make sure you created the `wish-list-images` bucket
- Verify it's set to **Public**
- Check the bucket name is exactly `wish-list-images` (case-sensitive)

### Can't see tables
- Go back to SQL Editor and run `schema.sql` again
- Make sure there were no errors when running it

### Authentication not working
- Double-check your `.env.local` file has the correct URL and key
- Make sure you copied the **anon public** key, not the service role key
- Restart your dev server after changing `.env.local`

## Quick Reference: Where to Find Things in Supabase

- **SQL Editor**: Left sidebar → SQL Editor
- **Table Editor**: Left sidebar → Table Editor
- **Storage**: Left sidebar → Storage
- **API Settings**: Settings (gear) → API
- **Policies**: Click on any table → Policies tab


