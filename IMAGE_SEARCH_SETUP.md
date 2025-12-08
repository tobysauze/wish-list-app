# Image Search Setup Guide

This guide explains how to set up Google Cloud Vision API to enable automatic product identification from images.

## Overview

When users upload an image of a product, the app can automatically:
- Identify what product is in the image
- Extract product name, brand, and description
- Use this information to search for prices

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "Wish List App")
4. Click "Create"

### 2. Enable Cloud Vision API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Cloud Vision API"
3. Click on "Cloud Vision API"
4. Click **Enable**

### 3. Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key (you'll need this)
4. (Optional) Click "Restrict Key" to limit usage:
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Vision API"
   - Click "Save"

### 4. Add API Key to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `GOOGLE_VISION_API_KEY`
   - **Value**: Your API key from step 3
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for the changes to take effect

## Pricing

Google Cloud Vision API pricing:
- **First 1,000 units/month**: FREE
- **1,001 - 5,000,000 units/month**: $1.50 per 1,000 units
- Each image analysis counts as 1 unit

For most apps, the free tier (1,000 images/month) should be sufficient.

## How It Works

1. User uploads an image
2. Image is sent to Google Cloud Vision API
3. API analyzes the image and returns:
   - **Labels**: What objects/products are detected
   - **Text**: Any text visible in the image (product names, brands)
   - **Objects**: Specific products detected
4. App uses this information to:
   - Auto-fill the product title
   - Auto-fill the description
   - Search for prices using the identified product name

## Testing

1. After adding the API key and redeploying, try uploading an image
2. The app should automatically identify the product and fill in the title
3. If it doesn't work, check:
   - API key is correctly set in Vercel
   - Vision API is enabled in Google Cloud Console
   - Check browser console for errors

## Troubleshooting

### "Vision API not configured"
- Make sure `GOOGLE_VISION_API_KEY` is set in Vercel environment variables
- Redeploy after adding the variable

### "Vision API error: 403"
- API key might be restricted incorrectly
- Check that Cloud Vision API is enabled for your project
- Verify the API key has proper permissions

### "No results from Vision API"
- Image might be too blurry or unclear
- Try a clearer image with visible product name/brand
- The API works best with clear product photos

### High costs
- Monitor usage in Google Cloud Console
- Set up billing alerts
- Consider restricting API key to specific IPs if needed

## Alternative: Manual Entry

If Vision API is not configured, users can still:
- Upload images manually
- Enter product names manually
- Use the app normally

The image analysis is optional and enhances the user experience but is not required.

