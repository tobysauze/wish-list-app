# Affiliate Link Monetization Setup Guide

Your wish list app is now set up to automatically convert product links to affiliate links, allowing you to earn commissions when users purchase items!

## How It Works

1. **User adds a product link** - When someone adds an item with a product URL
2. **Automatic conversion** - Skimlinks JavaScript automatically converts links on the page
3. **User clicks and buys** - When someone clicks the link and makes a purchase
4. **You earn commission** - You receive a commission from the retailer

## Setup Options

### Option 1: Skimlinks JavaScript (Recommended - Already Configured!)

**Best for**: Automatic conversion of 60,000+ retailers

✅ **Already set up!** The Skimlinks script is already added to your app.

1. **Get your Skimlinks ID**:
   - Go to [hub.skimlinks.com/snapshot](https://hub.skimlinks.com/snapshot)
   - Copy your Skimlinks ID (the number in the script URL, e.g., `295544`)

2. **Add to Vercel** (Optional - defaults to your ID):
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_SKIMLINKS_ID` = your Skimlinks ID (e.g., `295544`)
   - Redeploy

3. **Wait for approval**:
   - Your account is pending approval (can take up to 3 working days)
   - Once approved, links will automatically convert

**How it works**:
- The Skimlinks script automatically detects product links on your pages
- It converts them to affiliate links when users click
- No manual conversion needed - it's all automatic!

**Pros**: 
- Supports 60,000+ retailers automatically
- No need to manually configure each retailer
- Works automatically - just add the script (already done!)
- No API calls needed

**Cons**: 
- Takes a small percentage of commissions
- Account needs approval first

---

### Option 2: VigLink (Alternative)

**Best for**: Similar to Skimlinks

1. **Sign up**: Go to [viglink.com](https://www.viglink.com/)
2. **Create account** - Free to join
3. **Get API key and Site ID** - Found in your dashboard
4. **Add to Vercel**:
   - `VIGLINK_API_KEY` = your API key
   - `VIGLINK_SITE_ID` = your site ID
   - Redeploy

---

### Option 3: Amazon Associates (Amazon Only)

**Best for**: If most products are from Amazon

1. **Sign up**: Go to [affiliate-program.amazon.com](https://affiliate-program.amazon.com/)
2. **Create account** - Free to join
3. **Get Associate Tag** - Found in your account (e.g., `your-tag-20`)
4. **Add to Vercel**:
   - `AMAZON_ASSOCIATE_TAG` = your associate tag
   - Redeploy

**Pros**: 
- Higher commission rates for Amazon
- Direct relationship with Amazon

**Cons**: 
- Only works for Amazon products
- Requires approval process

---

### Option 4: Manual Configuration (Free, Limited)

**Best for**: If you have affiliate accounts with specific retailers

1. Edit `lib/affiliate.ts`
2. Update the `convertManually()` function
3. Add your affiliate IDs for each retailer

Example:
```typescript
// Amazon
if (hostname.includes('amazon.')) {
  urlObj.searchParams.set('tag', 'your-amazon-tag-20')
}

// Target
if (hostname.includes('target.com')) {
  urlObj.searchParams.set('ref', 'your-target-id')
}
```

---

## Recommended Setup

**For most users**: Start with **Skimlinks** - it's the easiest and supports the most retailers automatically.

## How Commissions Work

1. **Commission rates**: Vary by retailer (typically 1-10% of purchase)
2. **Payment**: Usually monthly, after reaching minimum threshold
3. **Tracking**: Links are automatically tracked by the affiliate service
4. **Transparency**: Users see the same product page, just with your affiliate ID

## Testing

After setup:
1. Add an item with a product link (e.g., Amazon product)
2. Check the link in the database or on the page
3. Verify it includes your affiliate ID/tag
4. Click the link and verify it redirects correctly

## Important Notes

- **User experience**: Links work exactly the same for users - they just include your affiliate ID
- **Privacy**: Affiliate links don't expose user data
- **Compliance**: Make sure to disclose affiliate relationships if required by law in your region
- **Performance**: Link conversion happens automatically in the background

## Troubleshooting

### Links not converting?
- Check environment variables are set correctly in Vercel
- Verify API keys are valid
- Check API service status

### Want to use multiple services?
- You can modify `lib/affiliate.ts` to try multiple services
- Try Skimlinks first, fallback to Amazon Associates for Amazon links

### Need help?
- Check the affiliate service's documentation
- Review `lib/affiliate.ts` for customization options

---

## Next Steps

1. ✅ Choose an affiliate service (recommend Skimlinks)
2. ✅ Sign up and get your API key/tag
3. ✅ Add environment variables to Vercel
4. ✅ Redeploy your app
5. ✅ Test by adding a product link
6. 🎉 Start earning commissions!

