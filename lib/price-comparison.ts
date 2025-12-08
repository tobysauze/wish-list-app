/**
 * Price Comparison Service
 * 
 * Searches for product prices across multiple retailers
 * Currently supports Google Shopping API
 */

interface PriceResult {
  retailer: string
  price: number
  currency: string
  product_url: string
  product_title: string
  image_url?: string
  in_stock: boolean
}

interface PriceComparisonOptions {
  query: string
  apiKey?: string
  maxResults?: number
}

/**
 * Search for prices using Google Shopping API
 * 
 * Setup:
 * 1. Go to https://console.cloud.google.com/
 * 2. Create a project
 * 3. Enable "Custom Search API"
 * 4. Create API key
 * 5. Create a Custom Search Engine at https://cse.google.com/
 * 6. Set search engine to search entire web
 * 7. Get your Search Engine ID
 */
export async function searchPrices(
  options: PriceComparisonOptions
): Promise<PriceResult[]> {
  const { query, apiKey, maxResults = 10 } = options

  if (!apiKey) {
    console.warn('Google Shopping API key not configured')
    return []
  }

  try {
    // Google Custom Search API endpoint
    // Note: This uses Custom Search API, not Shopping API directly
    // For better results, you'd use Google Shopping API (requires merchant account)
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || ''
    
    if (!searchEngineId) {
      console.warn('Google Search Engine ID not configured')
      return []
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.set('key', apiKey)
    url.searchParams.set('cx', searchEngineId)
    url.searchParams.set('q', query)
    url.searchParams.set('num', maxResults.toString())
    url.searchParams.set('safe', 'active')

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Parse results
    const results: PriceResult[] = []
    
    if (data.items) {
      for (const item of data.items) {
        // Extract price from snippet or title
        const priceMatch = extractPrice(item.snippet || item.title)
        
        if (priceMatch) {
          results.push({
            retailer: extractRetailer(item.displayLink),
            price: priceMatch.price,
            currency: priceMatch.currency || 'USD',
            product_url: item.link,
            product_title: item.title,
            image_url: item.pagemap?.cse_image?.[0]?.src,
            in_stock: true, // Assume in stock if found
          })
        }
      }
    }

    // Sort by price (lowest first)
    return results.sort((a, b) => a.price - b.price)
  } catch (error) {
    console.error('Error searching prices:', error)
    return []
  }
}

/**
 * Extract price from text
 * Looks for patterns like $29.99, £19.99, €25.00, etc.
 */
function extractPrice(text: string): { price: number; currency: string } | null {
  // Common price patterns
  const patterns = [
    /\$(\d+\.?\d*)/,           // $29.99
    /£(\d+\.?\d*)/,            // £19.99
    /€(\d+\.?\d*)/,            // €25.00
    /(\d+\.?\d*)\s*(USD|EUR|GBP)/i,  // 29.99 USD
    /price[:\s]*\$?(\d+\.?\d*)/i,    // Price: $29.99
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const price = parseFloat(match[1])
      if (!isNaN(price) && price > 0) {
        let currency = 'USD'
        if (text.includes('£')) currency = 'GBP'
        if (text.includes('€')) currency = 'EUR'
        if (match[2]) currency = match[2].toUpperCase()
        
        return { price, currency }
      }
    }
  }

  return null
}

/**
 * Extract retailer name from domain
 */
function extractRetailer(domain: string): string {
  // Remove www. and common TLDs
  const cleaned = domain
    .replace(/^www\./, '')
    .replace(/\.(com|co\.uk|ca|au|de|fr)$/, '')
  
  // Capitalize first letter
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/**
 * Alternative: Use SerpAPI for better price results
 * Sign up at: https://serpapi.com/
 */
export async function searchPricesWithSerpAPI(
  query: string,
  apiKey?: string
): Promise<PriceResult[]> {
  if (!apiKey) {
    console.warn('SerpAPI key not configured')
    return []
  }

  try {
    const url = new URL('https://serpapi.com/search')
    url.searchParams.set('engine', 'google_shopping')
    url.searchParams.set('q', query)
    url.searchParams.set('api_key', apiKey)
    url.searchParams.set('num', '10')

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.statusText}`)
    }

    const data = await response.json()

    const results: PriceResult[] = []

    if (data.shopping_results) {
      for (const item of data.shopping_results) {
        if (item.price) {
          results.push({
            retailer: item.source || 'Unknown',
            price: parseFloat(item.price.replace(/[^0-9.]/g, '')),
            currency: item.currency || 'USD',
            product_url: item.link,
            product_title: item.title,
            image_url: item.thumbnail,
            in_stock: item.in_stock !== false,
          })
        }
      }
    }

    return results.sort((a, b) => a.price - b.price)
  } catch (error) {
    console.error('Error searching prices with SerpAPI:', error)
    return []
  }
}

/**
 * Get price comparison configuration from environment
 */
export function getPriceComparisonConfig() {
  // Prefer SerpAPI if available (better results)
  if (process.env.SERPAPI_KEY) {
    return {
      provider: 'serpapi' as const,
      apiKey: process.env.SERPAPI_KEY,
    }
  }

  // Fallback to Google Custom Search
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
    return {
      provider: 'google' as const,
      apiKey: process.env.GOOGLE_API_KEY,
      searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
    }
  }

  return null
}

