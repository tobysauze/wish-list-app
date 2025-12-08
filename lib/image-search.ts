/**
 * Image Search Service
 * 
 * Uses Google Cloud Vision API to identify products in images
 * Then searches for prices using the identified product name
 */

interface ImageSearchResult {
  productName: string | null
  description: string | null
  labels: string[]
  error?: string
}

/**
 * Analyze image using Google Cloud Vision API
 * 
 * Setup:
 * 1. Go to https://console.cloud.google.com/
 * 2. Enable "Cloud Vision API"
 * 3. Create credentials (Service Account or API Key)
 * 4. Add API key to environment variables
 */
export async function analyzeProductImage(
  imageBase64: string,
  apiKey?: string
): Promise<ImageSearchResult> {
  if (!apiKey) {
    return {
      productName: null,
      description: null,
      labels: [],
      error: 'Google Vision API key not configured',
    }
  }

  try {
    // Google Cloud Vision API endpoint
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            image: {
              content: imageBase64.split(',')[1] || imageBase64, // Remove data:image/jpeg;base64, prefix if present
            },
            features: [
              {
                type: 'LABEL_DETECTION',
                maxResults: 10,
              },
              {
                type: 'TEXT_DETECTION',
                maxResults: 10,
              },
              {
                type: 'OBJECT_LOCALIZATION',
                maxResults: 10,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vision API error:', errorText)
      return {
        productName: null,
        description: null,
        labels: [],
        error: `Vision API error: ${response.statusText}`,
      }
    }

    const data = await response.json()

    if (data.responses && data.responses[0]) {
      const response = data.responses[0]
      
      // Extract labels (what's in the image)
      const labels = response.labelAnnotations?.map((l: any) => l.description) || []
      
      // Extract text (product names, brands, etc.)
      const textAnnotations = response.textAnnotations?.[0]?.description || ''
      
      // Extract objects (specific products)
      const objects = response.localizedObjectAnnotations?.map((o: any) => o.name) || []
      
      // Build product name from detected text or objects
      let productName: string | null = null
      if (textAnnotations) {
        // Use first line of detected text as product name
        const lines = textAnnotations.split('\n').filter((l: string) => l.trim().length > 0)
        if (lines.length > 0) {
          productName = lines[0].trim()
        }
      } else if (objects.length > 0) {
        // Use detected objects
        productName = objects.join(' ')
      } else if (labels.length > 0) {
        // Use top labels as fallback
        productName = labels.slice(0, 3).join(' ')
      }
      
      // Build description from labels
      const description = labels.slice(0, 5).join(', ')
      
      return {
        productName,
        description,
        labels: labels.slice(0, 10),
      }
    }

    return {
      productName: null,
      description: null,
      labels: [],
      error: 'No results from Vision API',
    }
  } catch (error: any) {
    console.error('Error analyzing image:', error)
    return {
      productName: null,
      description: null,
      labels: [],
      error: error.message || 'Failed to analyze image',
    }
  }
}

/**
 * Convert image file to base64
 */
export function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get Vision API configuration
 */
export function getVisionApiConfig() {
  if (process.env.GOOGLE_VISION_API_KEY) {
    return {
      apiKey: process.env.GOOGLE_VISION_API_KEY,
    }
  }
  return null
}

