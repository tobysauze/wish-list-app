# Price Comparison Feature - Setup Guide

## ✅ What's Already Done

- ✅ Database schema created (`add-price-comparison-schema.sql`)
- ✅ Price search API route (`/api/search-prices`)
- ✅ Price comparison UI component
- ✅ Integrated into wish list pages
- ✅ Caching system (24-hour cache)

## 🚀 Setup Options

### Option 1: Google Custom Search API (Free Tier - Recommended to Start)

**Free Tier**: 100 searches/day

1. **Create Google Cloud Project**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com/)
   - Create a new project
   - Enable "Custom Search API"

2. **Create API Key**:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → API Key
   - Copy your API key

3. **Create Custom Search Engine**:
   - Go to [cse.google.com](https://cse.google.com/)
   - Click "Add" to create a new search engine
   - Set "Sites to search" to: `*` (search entire web)
   - Click "Create"
   - Go to "Setup" → "Basics"
   - Copy your "Search engine ID" (looks like: `017576662512468239146:omuauf_lfve`)

4. **Add to Vercel**:
   - Go to Vercel → Your Project → Settings → Environment Variables
   - Add:
     - `GOOGLE_API_KEY` = your API key
     - `GOOGLE_SEARCH_ENGINE_ID` = your search engine ID
   - Redeploy

**Cost**: Free (100 searches/day), then ~$5 per 1,000 searches

---

### Option 2: SerpAPI (Paid - Better Results)

**Best for**: Production apps with higher traffic

1. **Sign up**: Go to [serpapi.com](https://serpapi.com/)
2. **Get API Key**: Found in your dashboard
3. **Add to Vercel**:
   - `SERPAPI_KEY` = your API key
   - Redeploy

**Cost**: ~$50/month for 5,000 searches

**Pros**:
- Better product matching
- More accurate prices
- Covers Google Shopping + other sources

---

## 📋 Database Setup

Run the SQL schema in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/add-price-comparison-schema.sql`
3. Paste and run

This creates:
- `price_comparisons` table
- Indexes for performance
- RLS policies

---

## 🎯 How It Works

1. **User clicks "Compare Prices"** on a wish list item
2. **System searches** for the product using title/description
3. **Results displayed** showing:
   - Cheapest option (highlighted in green)
   - Top 5 retailers with prices
   - Links to each retailer
4. **Results cached** for 24 hours to minimize API calls

## 🧪 Testing

1. Add an item to your wish list (with or without product link)
2. Click "💰 Compare Prices" button
3. Wait for search results (may take a few seconds)
4. See price comparison with cheapest option highlighted

## ⚙️ Features

### Current Features:
- ✅ Search prices for any product
- ✅ Display top 5 cheapest options
- ✅ Highlight best price
- ✅ Link to each retailer
- ✅ 24-hour caching
- ✅ Works with or without product links

### Future Enhancements:
- Price history tracking
- Price drop alerts
- Email notifications
- Price predictions
- "Best deal" badge

## 🔧 Configuration Priority

The system checks APIs in this order:
1. **SerpAPI** (if `SERPAPI_KEY` is set) - Best results
2. **Google Custom Search** (if `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set)
3. **None** - Shows error message

## 💡 Tips

1. **Start with Google Custom Search** (free tier)
2. **Upgrade to SerpAPI** when you need better results
3. **Monitor API usage** to avoid unexpected costs
4. **Cache aggressively** - 24-hour cache minimizes API calls

## 🐛 Troubleshooting

**"Price comparison API not configured" error?**
- Make sure environment variables are set in Vercel
- Redeploy after adding variables

**No prices found?**
- Try adding more details to product title/description
- Some products may not have prices available online
- Check API quota hasn't been exceeded

**Prices seem inaccurate?**
- Google Custom Search may not always find exact matches
- Consider upgrading to SerpAPI for better results

---

## 📊 Cost Management

- **Free tier**: 100 searches/day (Google Custom Search)
- **Cache**: Results cached for 24 hours (reduces API calls)
- **Manual refresh**: Users can refresh prices manually
- **Monitor usage**: Check API dashboards regularly

---

**Ready to go!** Just set up your API keys and start comparing prices! 🎉

