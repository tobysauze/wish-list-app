/**
 * Image Search Service
 * 
 * Uses multiple methods to identify products in images:
 * 1. Google Gemini Vision API (best for product recognition)
 * 2. SerpAPI Reverse Image Search (uses Google Lens)
 * 3. Google Cloud Vision API (fallback)
 */

interface ImageSearchResult {
  productName: string | null
  description: string | null
  labels: string[]
  error?: string
  method?: string // Which method was used
}

/**
 * Main function to analyze product image
 * Tries multiple methods in order: Gemini > SerpAPI > Vision API
 */
export async function analyzeProductImage(
  imageBase64: string,
  apiKey?: string,
  provider?: 'gemini' | 'serpapi' | 'vision'
): Promise<ImageSearchResult> {
  const config = getVisionApiConfig()
  const activeProvider = provider || config?.provider || 'vision'
  const activeKey = apiKey || config?.apiKey

  // Try Gemini first (best results)
  if (activeProvider === 'gemini' || (!provider && config?.provider === 'gemini')) {
    const result = await analyzeProductImageWithGemini(imageBase64, activeKey)
    if (result.productName && !result.error) {
      return result
    }
  }

  // Fallback to Vision API
  return analyzeProductImageWithVisionAPI(imageBase64, activeKey)
}

/**
 * Analyze image using Google Cloud Vision API (Fallback method)
 * 
 * Setup:
 * 1. Go to https://console.cloud.google.com/
 * 2. Enable "Cloud Vision API"
 * 3. Create credentials (Service Account or API Key)
 * 4. Add API key to environment variables
 */
export async function analyzeProductImageWithVisionAPI(
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
        method: 'vision',
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
 * Analyze image using Google Gemini Vision API (Best for product recognition)
 */
export async function analyzeProductImageWithGemini(
  imageBase64: string,
  apiKey?: string
): Promise<ImageSearchResult> {
  if (!apiKey) {
    return {
      productName: null,
      description: null,
      labels: [],
      error: 'Google Gemini API key not configured',
    }
  }

  try {
    // Remove data URL prefix if present and detect MIME type
    let base64Image = imageBase64
    let mimeType = 'image/jpeg' // default
    
    if (imageBase64.includes(',')) {
      const parts = imageBase64.split(',')
      const dataUrlPrefix = parts[0]
      base64Image = parts[1]
      
      // Detect MIME type from data URL
      if (dataUrlPrefix.includes('image/png')) {
        mimeType = 'image/png'
      } else if (dataUrlPrefix.includes('image/jpeg') || dataUrlPrefix.includes('image/jpg')) {
        mimeType = 'image/jpeg'
      } else if (dataUrlPrefix.includes('image/webp')) {
        mimeType = 'image/webp'
      } else if (dataUrlPrefix.includes('image/gif')) {
        mimeType = 'image/gif'
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'What product is shown in this image? Please provide:\n1. The exact product name/brand\n2. A brief description\n3. Key features or details\n\nFormat your response as:\nProduct: [name]\nDescription: [description]\nFeatures: [features]',
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Gemini API error: ${response.statusText}`
      
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error?.message) {
          errorMessage = `Gemini API error: ${errorData.error.message}`
        } else if (errorData.error) {
          errorMessage = `Gemini API error: ${JSON.stringify(errorData.error)}`
        }
      } catch {
        // If error text is not JSON, use the text as-is
        if (errorText) {
          errorMessage = `Gemini API error: ${errorText.substring(0, 200)}`
        }
      }
      
      console.error('Gemini API error:', errorText)
      return {
        productName: null,
        description: null,
        labels: [],
        error: errorMessage,
      }
    }

    const data = await response.json()

    if (data.candidates && data.candidates[0]?.content?.parts) {
      const text = data.candidates[0].content.parts[0].text || ''
      
      // Parse the response
      let productName: string | null = null
      let description: string | null = null
      const labels: string[] = []

      // Extract product name
      const productMatch = text.match(/Product:\s*(.+?)(?:\n|Description:|$)/i)
      if (productMatch) {
        productName = productMatch[1].trim()
      }

      // Extract description
      const descMatch = text.match(/Description:\s*(.+?)(?:\n|Features:|$)/i)
      if (descMatch) {
        description = descMatch[1].trim()
      }

      // Extract features/labels
      const featuresMatch = text.match(/Features:\s*([\s\S]+?)$/i)
      if (featuresMatch) {
        const features = featuresMatch[1].split(',').map((f: string) => f.trim())
        labels.push(...features)
      }

      // If no structured format, try to extract from free text
      if (!productName && text) {
        const lines = text.split('\n').filter((l: string) => l.trim().length > 0)
        if (lines.length > 0) {
          productName = lines[0].trim()
          if (lines.length > 1) {
            description = lines.slice(1).join(' ').trim()
          }
        }
      }

      return {
        productName,
        description,
        labels,
        method: 'gemini',
      }
    }

    return {
      productName: null,
      description: null,
      labels: [],
      error: 'No results from Gemini API',
    }
  } catch (error: any) {
    console.error('Error analyzing image with Gemini:', error)
    return {
      productName: null,
      description: null,
      labels: [],
      error: error.message || 'Failed to analyze image with Gemini',
    }
  }
}

/**
 * Analyze image using SerpAPI Reverse Image Search (uses Google Lens)
 * Note: SerpAPI requires the image to be hosted at a public URL
 * For now, this is a placeholder - Gemini is recommended instead
 */
export async function analyzeProductImageWithSerpAPI(
  imageBase64: string,
  apiKey?: string
): Promise<ImageSearchResult> {
  // SerpAPI reverse image search requires a public image URL
  // This would require uploading the image first, which adds complexity
  // Gemini API is simpler and gives better results
  return {
    productName: null,
    description: null,
    labels: [],
    error: 'SerpAPI reverse image search requires image hosting. Use Gemini API instead for better results.',
  }
}

/**
 * Get Vision API configuration
 */
export function getVisionApiConfig() {
  // Priority: Gemini (best) > Vision API (fallback)
  if (process.env.GOOGLE_GEMINI_API_KEY) {
    return {
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
      provider: 'gemini',
    }
  }
  if (process.env.GOOGLE_VISION_API_KEY) {
    return {
      apiKey: process.env.GOOGLE_VISION_API_KEY,
      provider: 'vision',
    }
  }
  return null
}

