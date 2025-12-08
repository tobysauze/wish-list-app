# Price Comparison Troubleshooting

## Issue: "No prices found" but Google Search shows results

### Problem
Google Custom Search API returns **general web results**, not **Google Shopping results**. This means:
- Regular Google search shows shopping results ✅
- Google Custom Search API may not find the same results ❌

### Solutions

#### Option 1: Use SerpAPI (Recommended for Better Results)
SerpAPI specifically supports Google Shopping and returns better price comparison results.

1. Sign up at [serpapi.com](https://serpapi.com/)
2. Get your API key
3. Add to Vercel: `SERPAPI_KEY` = your key
4. Redeploy

**Why SerpAPI is better:**
- ✅ Specifically designed for shopping results
- ✅ Returns structured price data
- ✅ Better product matching
- ✅ More accurate prices

#### Option 2: Improve Search Query (Already Done)
We've improved the search query to include:
- "buy price" keywords
- Better price extraction
- Shopping-related filtering

#### Option 3: Use Google Shopping API (Requires Merchant Account)
- Requires Google Merchant Center account
- More complex setup
- Better for merchants, not ideal for price comparison

### Current Improvements Made

1. **Better Search Query**: Now adds "buy price" to search queries
2. **Improved Price Extraction**: Better at finding £, $, € prices
3. **Filtering**: Skips non-product pages (Wikipedia, Reddit, etc.)
4. **Multiple Patterns**: Tries various price formats

### Testing

Try searching for:
- "Hyundai 1500W 100L Oil Free Low Noise Electric Air Compressor buy price"
- Should find more shopping results now

### If Still Not Working

1. **Check API Quota**: Make sure you haven't exceeded free tier (100/day)
2. **Try SerpAPI**: Much better for shopping results
3. **Check Search Engine Settings**: Make sure it's set to search entire web (`*`)
4. **Verify API Keys**: Check they're set correctly in Vercel

### Expected Behavior

- **Google Custom Search**: May find some prices, but not always shopping-specific
- **SerpAPI**: Should find shopping results consistently
- **Results**: Should show top 5 cheapest options with retailer names

