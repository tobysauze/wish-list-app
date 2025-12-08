# Setup Instructions

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Supabase Account** (free tier available at [supabase.com](https://supabase.com))

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: `wish-list-app` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Wait for the project to be created (takes ~2 minutes)

### Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys" → "anon public")

### Create Environment Variables

1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Set Up the Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned"

### Set Up Storage Bucket for Images

1. In Supabase dashboard, go to **Storage**
2. Click "New bucket"
3. Name: `wish-list-images`
4. Make it **Public** (uncheck "Private bucket")
5. Click "Create bucket"

6. Set up storage policies (go to **Storage** → **Policies** → `wish-list-images`):
   - Click "New Policy"
   - Policy name: "Allow authenticated uploads"
   - Allowed operation: INSERT
   - Policy definition:
     ```sql
     (bucket_id = 'wish-list-images'::text) AND (auth.role() = 'authenticated'::text)
     ```
   - Click "Review" then "Save policy"

   - Create another policy for SELECT:
     - Policy name: "Allow public reads"
     - Allowed operation: SELECT
     - Policy definition:
       ```sql
       (bucket_id = 'wish-list-images'::text)
       ```
     - Click "Review" then "Save policy"

## Step 3: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Test the App

1. **Sign Up**: Create a new account at `/auth/signup`
2. **Add Items**: Go to your dashboard and add items to your wish list
3. **Search Users**: Use the search page to find other users
4. **View Lists**: Click on a user to view their wish list
5. **Mark Purchased**: Mark items as purchased (prevents duplicate purchases)
6. **Save Users**: Save users for quick access later

## Troubleshooting

### Database Errors

If you see database errors:
- Make sure you ran the SQL schema file (`supabase/schema.sql`)
- Check that all tables were created in the **Table Editor** in Supabase dashboard

### Image Upload Errors

If image uploads fail:
- Verify the storage bucket `wish-list-images` exists and is public
- Check that storage policies are set up correctly
- Make sure you're logged in when uploading images

### Authentication Issues

If you can't log in:
- Check that your `.env.local` file has the correct Supabase URL and key
- Verify the Supabase project is active
- Check browser console for errors

## Next Steps

### Optional: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### Optional: Set Up Affiliate Links

To enable affiliate link conversion:
1. Sign up for an affiliate service (e.g., Skimlinks, VigLink, or Amazon Associates)
2. Add your API key to `.env.local`:
   ```
   AFFILIATE_API_KEY=your_api_key_here
   ```
3. Implement the affiliate link conversion logic in your item creation flow

## Features Implemented

✅ User authentication (sign up/login)
✅ User profiles with search (by name, email, phone)
✅ Wish list creation and management
✅ Add items with text, images, and links
✅ Mark items as purchased
✅ Secret items (hidden from list owner)
✅ Saved users/friends dashboard
✅ Image uploads

## Features To Add

- [ ] Affiliate link conversion
- [ ] Email notifications
- [ ] Push notifications
- [ ] Item editing/deletion
- [ ] Wish list sharing via link
- [ ] Categories/tags for items
- [ ] Price tracking
- [ ] Multiple wish lists per user


