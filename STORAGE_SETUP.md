# Storage Bucket Setup Guide

## Quick Fix: Set Up Image Storage

The "Bucket not found" error occurs because the Supabase storage bucket for images hasn't been created yet. Follow these steps to set it up:

### Step 1: Create the Storage Bucket

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click **New bucket**
5. Fill in the details:
   - **Name**: `wish-list-images` (must be exactly this name)
   - **Public bucket**: ✅ Check this box (important!)
   - **File size limit**: Leave default or set your preferred limit
   - **Allowed MIME types**: Leave empty (allows all image types)
6. Click **Create bucket**

### Step 2: Set Up Storage Policies

After creating the bucket, you need to set up policies so users can upload and view images:

1. In the Storage section, click on the `wish-list-images` bucket
2. Click on **Policies** tab
3. Click **New Policy**

#### Policy 1: Allow Authenticated Users to Upload

1. Click **New Policy** → **For full customization**
2. Policy name: `Allow authenticated uploads`
3. Allowed operation: `INSERT`
4. Policy definition (SQL):
   ```sql
   (bucket_id = 'wish-list-images'::text) AND (auth.role() = 'authenticated'::text)
   ```
5. Click **Review** then **Save policy**

#### Policy 2: Allow Public Read Access

1. Click **New Policy** → **For full customization**
2. Policy name: `Allow public reads`
3. Allowed operation: `SELECT`
4. Policy definition (SQL):
   ```sql
   (bucket_id = 'wish-list-images'::text)
   ```
5. Click **Review** then **Save policy**

### Step 3: Test It

1. Go back to your app
2. Try adding an item with an image
3. It should work now!

## Alternative: Add Items Without Images

If you don't want to set up storage right now, you can still add items to your wish list - just don't select an image file. The form will work fine with just text and links.

## Troubleshooting

### Still getting "Bucket not found"?
- Make sure the bucket name is exactly `wish-list-images` (case-sensitive)
- Refresh your browser after creating the bucket
- Check that you're logged into the correct Supabase project

### Images not uploading?
- Verify the bucket is set to **Public**
- Check that both policies are created and enabled
- Make sure you're logged into the app when uploading

### Images not displaying?
- Ensure the "Allow public reads" policy is set up
- Check that the bucket is public
- Verify the image URL is being generated correctly (check browser console)


