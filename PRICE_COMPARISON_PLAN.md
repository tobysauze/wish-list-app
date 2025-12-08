# Price Comparison Feature - Implementation Plan

## Overview
Add automatic price comparison for wish list items to help users find the best deals.

## Approach Options

### Option 1: Google Shopping API (Recommended - Free Tier Available)
**Pros:**
- Free tier: 100 requests/day
- Good product matching
- Covers many retailers
- Official API

**Cons:**
- Requires Google Cloud account
- Rate limits on free tier
- May need paid tier for production

**Cost:** Free (up to 100 requests/day), then ~$5 per 1,000 requests

### Option 2: SerpAPI (Paid - Best Results)
**Pros:**
- Excellent product matching
- Covers Google Shopping + other sources
- Simple API
- Good documentation

**Cons:**
- Paid service (~$50/month for 5,000 searches)
- Requires API key

**Cost:** ~$50/month for 5,000 searches

### Option 3: PriceAPI (Paid - Price Focused)
**Pros:**
- Specifically designed for price comparison
- Good coverage
- Simple API

**Cons:**
- Paid service
- May have fewer retailers than Google Shopping

**Cost:** ~$29/month for 10,000 requests

### Option 4: Hybrid Approach (Recommended for MVP)
- Start with Google Shopping API (free tier)
- Cache results to minimize API calls
- Add manual refresh option
- Can upgrade to paid service later

## Implementation Plan

### Phase 1: Database Schema
1. Create `price_comparisons` table to store price data
2. Store: item_id, retailer, price, currency, link, last_updated
3. Cache results to avoid excessive API calls

### Phase 2: Price Search API
1. Create API route: `/api/search-prices`
2. Extract product name from item title/description
3. Search Google Shopping API
4. Parse and store results
5. Return cheapest options

### Phase 3: UI Components
1. "Compare Prices" button on wish list items
2. Price comparison modal/card showing:
   - Cheapest option (highlighted)
   - Top 3-5 retailers with prices
   - Links to each retailer
3. Price history (optional, future)

### Phase 4: Automation
1. Background job to refresh prices (daily/weekly)
2. Price drop alerts (optional, future)
3. Email notifications (optional, future)

## Database Schema

```sql
CREATE TABLE public.price_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES public.wish_list_items(id) ON DELETE CASCADE,
  retailer TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  product_url TEXT NOT NULL,
  product_title TEXT,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(item_id, retailer, product_url)
);

CREATE INDEX idx_price_comparisons_item_id ON public.price_comparisons(item_id);
CREATE INDEX idx_price_comparisons_price ON public.price_comparisons(item_id, price);
```

## User Flow

1. User adds item to wish list (with or without link)
2. User clicks "Compare Prices" button
3. System searches for product using title/description
4. Shows price comparison card with:
   - Cheapest option (highlighted in green)
   - Other options sorted by price
   - Links to each retailer
5. Prices cached for 24 hours
6. User can manually refresh prices

## Features

### MVP (Minimum Viable Product)
- ✅ Search prices for a product
- ✅ Display top 5 cheapest options
- ✅ Show retailer name and price
- ✅ Link to each retailer
- ✅ Cache results for 24 hours

### Future Enhancements
- Price history graph
- Price drop alerts
- Email notifications
- Price tracking over time
- "Best deal" badge
- Price predictions

## Technical Considerations

1. **Rate Limiting**: Cache aggressively to minimize API calls
2. **Product Matching**: Use title + description for better accuracy
3. **Error Handling**: Graceful fallback if API fails
4. **Performance**: Async price fetching, show loading state
5. **Cost Management**: Limit searches per user/day

## Next Steps

1. Set up Google Shopping API (or chosen service)
2. Create database schema
3. Build price search API route
4. Create UI components
5. Test with real products
6. Deploy and monitor usage

