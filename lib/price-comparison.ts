/**
 * Price Comparison Service
 * 
 * Searches for product prices across multiple retailers
 * Currently supports Google Shopping API
 */

import { fetchPriceFromPage } from './price-fetcher'

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
    url.searchParams.set('num', Math.min(maxResults, 10).toString()) // Max 10 per request
    url.searchParams.set('safe', 'active')
    // Add fileType and searchType to help find product pages
    url.searchParams.set('fileType', '')
    // Try to get more shopping-related results

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`)
    }

    const data = await response.json()

    // Parse results
    const results: PriceResult[] = []
    
    if (data.items) {
      for (const item of data.items) {
        // Try to extract price from multiple sources
        const snippet = item.snippet || ''
        const title = item.title || ''
        const fullText = `${title} ${snippet}`.toLowerCase()
        
        // Skip if it's clearly not a product page (e.g., Wikipedia, reviews, etc.)
        const skipDomains = ['wikipedia.org', 'reddit.com', 'youtube.com', 'facebook.com']
        const shouldSkip = skipDomains.some(domain => item.displayLink?.includes(domain))
        
        if (shouldSkip) continue
        
        // Look for price indicators in the text
        const priceMatch = extractPrice(fullText)
        
        // Also check if it looks like a product page (has price-related keywords)
        const hasPriceKeywords = /(price|£|\$|€|buy|purchase|for sale|add to cart|add to basket)/i.test(fullText)
        
        // Only add results if we found an actual price
        if (priceMatch && priceMatch.price > 0) {
          results.push({
            retailer: extractRetailer(item.displayLink),
            price: priceMatch.price,
            currency: priceMatch.currency || 'GBP',
            product_url: item.link,
            product_title: item.title,
            image_url: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src,
            in_stock: true,
          })
        } else if (hasPriceKeywords && item.link) {
          // If it looks like a product page but no price found, try to fetch price from the page
          // This is a fallback - we'll try to get the price from the actual product page
          try {
            const pagePrice = await fetchPriceFromPage(item.link)
            if (pagePrice && pagePrice.price > 0) {
              results.push({
                retailer: extractRetailer(item.displayLink),
                price: pagePrice.price,
                currency: pagePrice.currency || 'GBP',
                product_url: item.link,
                product_title: item.title,
                image_url: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src,
                in_stock: true,
              })
            }
            // If we can't get price from page, skip this result (don't add placeholder)
          } catch (err) {
            // Skip if we can't fetch price
            console.log('Skipping result without price:', item.link)
          }
        }
      }
    }
    
    // Sort results by price (only valid prices should be in results now)
    return results.sort((a, b) => a.price - b.price)
  } catch (error) {
    console.error('Error searching prices:', error)
    return []
  }
}

/**
 * Extract price from text
 * Looks for patterns like $29.99, £19.99, €25.00, etc.
 * Improved to handle UK prices (£) and various formats
 */
function extractPrice(text: string): { price: number; currency: string } | null {
  // Common price patterns - more comprehensive
  const patterns = [
    /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,           // £29.99 or £1,299.99
    /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,          // $29.99 or $1,299.99
    /€\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,           // €25.00
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:GBP|pounds?)/i,  // 29.99 GBP or 29.99 pounds
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)/i, // 29.99 USD
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:EUR|euros?)/i,   // 25.00 EUR
    /price[:\s]*[£$€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i, // Price: £29.99
    /now[:\s]*[£$€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,   // Now: £29.99
    /was[:\s]*[£$€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,   // Was: £29.99
    /[£$€]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,       // Generic currency symbol
  ]

  // Try each pattern
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      // Remove commas and parse
      const priceStr = match[1].replace(/,/g, '')
      const price = parseFloat(priceStr)
      
      if (!isNaN(price) && price > 0 && price < 1000000) { // Reasonable price range
        // Determine currency
        let currency = 'USD'
        if (text.includes('£') || /GBP|pound/i.test(text)) currency = 'GBP'
        else if (text.includes('€') || /EUR|euro/i.test(text)) currency = 'EUR'
        else if (text.includes('$') || /USD|dollar/i.test(text)) currency = 'USD'
        
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

