# 🚀 Deploy Your Wish List App Online

Your app is ready to deploy! Here's how to make it accessible worldwide.

## Quick Start: Deploy to Vercel (Recommended)

Vercel is the easiest option - it's made by the Next.js team and offers free hosting.

### Step 1: Initialize Git (if not done)

```bash
git init
git add .
git commit -m "Initial commit - Wish List App"
```

### Step 2: Push to GitHub

1. Go to [github.com](https://github.com) and create a new repository
2. Name it something like `wish-list-app`
3. **Don't** initialize with README (you already have files)
4. Copy the repository URL
5. Run these commands:

```bash
git remote add origin https://github.com/YOUR_USERNAME/wish-list-app.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Sign up**: Go to [vercel.com](https://vercel.com) and sign up (free)
   - You can sign up with GitHub (recommended)

2. **Import Project**:
   - Click "Add New Project"
   - Select your GitHub repository (`wish-list-app`)
   - Vercel will auto-detect Next.js settings ✅

3. **Add Environment Variables**:
   - Before clicking "Deploy", expand "Environment Variables"
   - Add these two variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL = (your Supabase URL from .env.local)
     NEXT_PUBLIC_SUPABASE_ANON_KEY = (your Supabase anon key from .env.local)
     ```
   - You can find these in your `.env.local` file or Supabase dashboard → Settings → API

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app will be live! 🎉

### Step 4: Configure Supabase for Production

**IMPORTANT**: You must update Supabase settings for auth to work!

1. Go to your Supabase project → **Settings** → **Authentication** → **URL Configuration**

2. Update **Site URL**:
   ```
   https://your-app-name.vercel.app
   ```
   (Replace `your-app-name` with your actual Vercel app name)

3. Add to **Redirect URLs**:
   ```
   https://your-app-name.vercel.app/auth/callback
   https://your-app-name.vercel.app/**
   ```

4. Click **Save**

### Step 5: Test Your Live App

1. Visit your Vercel URL (e.g., `https://wish-list-app.vercel.app`)
2. Try signing up a new account
3. Try logging in
4. Add an item to your wish list
5. Share with friends!

---

## Alternative: Deploy to Netlify

If you prefer Netlify:

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Add environment variables (same as Vercel)
6. Deploy!

---

## Environment Variables Checklist

Make sure these are set in your hosting platform:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Never commit `.env.local` to Git** - it's already in `.gitignore` ✅

---

## Custom Domain (Optional)

Want a custom domain like `wishlistapp.com`?

1. In Vercel: Project → Settings → Domains
2. Add your domain
3. Follow DNS setup instructions
4. Wait for DNS propagation (can take up to 24 hours)

---

## Troubleshooting

### ❌ "Auth not working"
- Check Supabase redirect URLs are set correctly
- Verify environment variables in Vercel match your `.env.local`

### ❌ "Images not loading"
- Check Supabase storage bucket policies
- Verify images are uploaded to Supabase Storage

### ❌ "Database errors"
- Make sure you ran the SQL schema in Supabase
- Check RLS policies are configured

### ❌ "Build failed"
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Try running `npm run build` locally first

---

## What Happens After Deployment?

✅ Your app is live at `https://your-app-name.vercel.app`  
✅ Anyone in the world can access it  
✅ Works on mobile, tablet, desktop  
✅ Automatically updates when you push to GitHub  
✅ Free SSL certificate (HTTPS)  
✅ Fast global CDN  

---

## Next Steps

1. ✅ Deploy to Vercel
2. ✅ Update Supabase redirect URLs
3. ✅ Test everything works
4. 🎉 Share with friends and family!

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
