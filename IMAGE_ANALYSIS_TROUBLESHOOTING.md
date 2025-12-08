# Image Analysis Troubleshooting

## Common Error: "Failed to analyze image" (400 Bad Request)

If you're seeing a 400 error when uploading an image, here are the most common causes and solutions:

### 1. Gemini API Key Not Set

**Symptom:** Error message says "No image analysis API configured"

**Solution:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create an API key
3. Add to Vercel: `GOOGLE_GEMINI_API_KEY` = your key
4. Redeploy

### 2. Gemini API Not Enabled

**Symptom:** Error says "Gemini API error: 403" or "API not enabled"

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Search for "Generative Language API"
4. Click **Enable**
5. Wait a few minutes, then try again

### 3. Invalid API Key

**Symptom:** Error says "Gemini API error: 401" or "Invalid API key"

**Solution:**
1. Check that the API key in Vercel matches the one from Google AI Studio
2. Make sure there are no extra spaces or characters
3. Regenerate the API key if needed
4. Redeploy after updating

### 4. API Quota Exceeded

**Symptom:** Error says "Gemini API error: 429" or "Quota exceeded"

**Solution:**
1. Check your usage in [Google Cloud Console](https://console.cloud.google.com/)
2. Free tier: 60 requests/minute, 1,500 requests/day
3. Wait a few minutes and try again
4. Consider upgrading if you need more

### 5. Image Format Issue

**Symptom:** Error says "Invalid image format" or "Bad Request"

**Solution:**
- The app now automatically detects image format (JPEG, PNG, WebP, GIF)
- Try a different image if one doesn't work
- Make sure the image file isn't corrupted

### 6. Image Too Large

**Symptom:** Error or timeout

**Solution:**
- Gemini API has size limits
- Try compressing the image or using a smaller file
- Maximum recommended: 4MB

## Checking What's Wrong

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for error messages when uploading an image
4. Check the **Network** tab to see the API response

### Step 2: Check API Configuration

Visit this URL to see which API is configured:
```
https://your-app.vercel.app/api/analyze-image
```

You should see an error message indicating what's missing.

### Step 3: Check Vercel Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to **Deployments** → Latest deployment → **Functions** tab
4. Look for `/api/analyze-image` logs
5. Check for error messages

## Expected Behavior

**If Gemini API is working:**
- Image uploads successfully
- Product name is auto-filled
- Description may be auto-filled
- No error messages

**If Gemini API is not configured:**
- Image uploads successfully
- No auto-fill happens
- User can still add item manually
- No error shown (silent fallback)

## Still Not Working?

1. **Check Vercel Environment Variables:**
   - Make sure `GOOGLE_GEMINI_API_KEY` is set
   - Check it's set for the right environment (Production/Preview/Development)
   - Redeploy after adding/changing variables

2. **Try Vision API as Fallback:**
   - Add `GOOGLE_VISION_API_KEY` instead
   - Less accurate but should work

3. **Check API Status:**
   - Visit [Google Cloud Status](https://status.cloud.google.com/)
   - Make sure Generative Language API is operational

4. **Test API Key Directly:**
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=YOUR_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"test"}]}]}'
   ```
   Should return a response (even if error, means API is reachable)

## Getting Help

If none of these solutions work:
1. Check the browser console for specific error messages
2. Check Vercel function logs for server-side errors
3. Share the specific error message you're seeing

