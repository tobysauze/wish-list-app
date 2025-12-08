# Google Gemini Vision API Setup

This guide explains how to set up Google Gemini Vision API for **much better** product recognition from images (similar to Google Lens/Gemini).

## Why Gemini?

- ✅ **Much better product recognition** than Vision API
- ✅ **More accurate descriptions** (similar to Google Lens)
- ✅ **Better at identifying specific products** and brands
- ✅ **Free tier available** (60 requests/minute)

## Setup Steps

### 1. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select your Google Cloud project (or create a new one)
5. Copy the API key

### 2. Enable Gemini API (if needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Search for "Generative Language API"
4. Click **Enable**

### 3. Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `GOOGLE_GEMINI_API_KEY`
   - **Value**: Your API key from step 1
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application

## Pricing

- **Free tier**: 60 requests/minute, 1,500 requests/day
- **Paid tier**: $0.00025 per image (very affordable)
- Much better value than Vision API for product recognition

## How It Works

1. User uploads an image
2. Image is sent to Gemini Vision API
3. Gemini analyzes the image and returns:
   - **Product name**: Exact product/brand name
   - **Description**: Detailed product description
   - **Features**: Key product features
4. App uses this information to:
   - Auto-fill the product title
   - Auto-fill the description
   - Search for prices using the identified product name

## Testing

1. After adding the API key and redeploying, try uploading an image
2. The app should automatically identify the product (much better than Vision API!)
3. Results should be similar to what you see in Google Lens/Gemini

## Comparison

| Feature | Vision API | Gemini Vision |
|---------|-----------|---------------|
| Product Recognition | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Accuracy | Good | Excellent |
| Descriptions | Basic | Detailed |
| Free Tier | 1,000/month | 1,500/day |
| Best For | General objects | Products, brands |

## Troubleshooting

### "Gemini API error: 403"
- Make sure Generative Language API is enabled
- Check that the API key is correct
- Verify billing is enabled (free tier still requires billing setup)

### "No results from Gemini API"
- Image might be too blurry
- Try a clearer product photo
- Check API quota in Google Cloud Console

### Still using Vision API?
- Make sure `GOOGLE_GEMINI_API_KEY` is set (not just `GOOGLE_VISION_API_KEY`)
- Redeploy after adding the variable
- Check that Gemini API is enabled in Google Cloud Console

## Migration from Vision API

If you already have `GOOGLE_VISION_API_KEY` set:
1. Add `GOOGLE_GEMINI_API_KEY` (Gemini will be used automatically)
2. Keep `GOOGLE_VISION_API_KEY` as fallback
3. Redeploy

Gemini will be used first, Vision API as fallback.

