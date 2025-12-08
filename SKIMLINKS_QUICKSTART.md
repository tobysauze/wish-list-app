# Skimlinks Quick Start Guide

## ✅ What's Already Done

Your Skimlinks integration is already set up! The JavaScript snippet has been added to your app.

## 📋 Next Steps

### 1. Account Approval (Currently Pending)

Your Skimlinks account is **pending approval**. This typically takes:
- **Up to 3 working days**
- You'll receive an email when approved

**What to do while waiting**:
- ✅ Your code is already in place
- ✅ Links will start converting automatically once approved
- ✅ You can test the app normally

### 2. Update Domain (After Approval)

**Important**: Your Skimlinks code is currently configured for:
```
wish-list-app-git-main-tobysauzes-projects.vercel.app
```

**When you get your production domain**:
1. Go to Skimlinks Dashboard → Snapshot
2. Update the domain to your production URL
3. Or add your production domain as an additional site

### 3. Optional: Customize Skimlinks ID

If you want to use a different Skimlinks ID:

1. **Get your ID** from [hub.skimlinks.com/snapshot](https://hub.skimlinks.com/snapshot)
   - It's the number in the script URL: `https://s.skimresources.com/js/295544`
   - Your ID: `295544` (from your dashboard)

2. **Add to Vercel**:
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SKIMLINKS_ID` = `295544`
   - Redeploy

**Note**: The code defaults to `295544` (your current ID), so this step is optional.

## 🎯 How It Works

1. **User adds product link** → Stored in database
2. **User views wish list** → Skimlinks script loads
3. **User clicks link** → Skimlinks automatically converts to affiliate link
4. **User makes purchase** → You earn commission!

## 🔍 Testing

**Before approval**: Links will work normally but won't convert yet
**After approval**: Links will automatically convert when clicked

### Quick Verification Test Page

Visit: **`https://your-app.vercel.app/test-skimlinks`**

This test page will:
- ✅ Check if Skimlinks script is loaded
- ✅ Detect if Skimlinks JavaScript is running
- ✅ Provide test product links to click
- ✅ Show detailed verification instructions

### Manual Verification Steps

1. **Check Script Loading**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Reload your page
   - Look for request to `skimresources.com/js/295544`
   - Should see status 200 (success)

2. **Check Console**:
   - DevTools → Console tab
   - Look for any Skimlinks-related messages
   - (May be minimal before approval)

3. **Check Links**:
   - Right-click a product link → Copy link address
   - Before approval: Original URL
   - After approval: URL will have Skimlinks parameters added

4. **After Approval**:
   - Links will automatically convert when clicked
   - Check Performance tab in Skimlinks dashboard for tracking

## 📊 Tracking Commissions

Once approved:
- Go to Skimlinks Dashboard → Performance
- View clicks, conversions, and earnings
- Payments are typically monthly

## 🚨 Important Notes

- **Domain restriction**: The code is tied to your Vercel URL. Update it in Skimlinks dashboard when you have a custom domain.
- **Approval required**: Links won't convert until your account is approved
- **Automatic**: No manual work needed - Skimlinks handles everything!

## ❓ Troubleshooting

**Links not converting?**
- Check if account is approved (check email)
- Verify domain matches in Skimlinks dashboard
- Check browser console for errors

**Want to disable temporarily?**
- Remove or comment out `<SkimlinksScript />` in `app/layout.tsx`
- Or set `NEXT_PUBLIC_SKIMLINKS_ENABLED=false` in Vercel

---

**You're all set!** Just wait for approval and your links will start earning commissions automatically. 🎉

