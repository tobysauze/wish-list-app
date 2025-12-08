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

    // Try multiple search queries to get more results
    const searchQueries = [
      query,                                    // Original query
      `${query} buy`,                           // Add "buy"
      `${query} price`,                         // Add "price"
      `${query} for sale`,                      // Add "for sale"
    ]

    const allResults: PriceResult[] = []
    const seenUrls = new Set<string>()

    // Search with each query variation
    for (const searchQuery of searchQueries.slice(0, 2)) { // Limit to 2 queries to avoid rate limits
      try {
        const url = new URL('https://www.googleapis.com/customsearch/v1')
        url.searchParams.set('key', apiKey)
        url.searchParams.set('cx', searchEngineId)
        url.searchParams.set('q', searchQuery)
        url.searchParams.set('num', '10') // Get max results per query
        url.searchParams.set('safe', 'active')

        const response = await fetch(url.toString())

        if (!response.ok) {
          console.warn(`Google API error for query "${searchQuery}": ${response.statusText}`)
          continue // Try next query
        }

        const data = await response.json()

        // Parse results from this query
        if (data.items) {
          for (const item of data.items) {
            // Skip duplicates
            if (seenUrls.has(item.link)) continue
            seenUrls.add(item.link)

            // Try to extract price from multiple sources
            const snippet = item.snippet || ''
            const title = item.title || ''
            const fullText = `${title} ${snippet}`.toLowerCase()
            
            // Skip if it's clearly not a product page
            const skipDomains = ['wikipedia.org', 'reddit.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 'pinterest.com']
            const shouldSkip = skipDomains.some(domain => item.displayLink?.includes(domain))
            
            if (shouldSkip) continue
            
            // Look for price indicators in the text
            const priceMatch = extractPrice(fullText)
            
            // Only add results if we found an actual, valid price
            if (priceMatch && priceMatch.price >= 0.01 && priceMatch.price <= 100000 && priceMatch.price !== 999999) {
              allResults.push({
                retailer: extractRetailer(item.displayLink),
                price: priceMatch.price,
                currency: priceMatch.currency || 'GBP',
                product_url: item.link,
                product_title: item.title,
                image_url: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src,
                in_stock: true,
              })
            }
          }
        }
      } catch (err) {
        console.warn(`Error searching with query "${searchQuery}":`, err)
        continue // Try next query
      }
    }
    
    // Remove duplicates by URL and sort by price
    const uniqueResults = Array.from(
      new Map(allResults.map(r => [r.product_url, r])).values()
    )
    
    return uniqueResults.sort((a, b) => a.price - b.price).slice(0, maxResults)
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
  // Common price patterns - more comprehensive and ordered by likelihood
  const patterns = [
    // UK prices (most common for UK users)
    /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,           // £29.99 or £1,299.99
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:GBP|pounds?|£)/gi,  // 29.99 GBP or 29.99 pounds
    // US prices
    /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,          // $29.99 or $1,299.99
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?|\$)/gi, // 29.99 USD
    // Euro prices
    /€\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,           // €25.00
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:EUR|euros?|€)/gi,   // 25.00 EUR
    // Contextual patterns
    /price[:\s]*[£$€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi, // Price: £29.99
    /now[:\s]*[£$€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,   // Now: £29.99
    /was[:\s]*[£$€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,   // Was: £29.99
    /from[:\s]*[£$€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,   // From: £29.99
    /only[:\s]*[£$€]?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/gi,   // Only: £29.99
    // Generic currency symbol (last resort)
    /[£$€]\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,       // Generic currency symbol
  ]

  // Try each pattern and find all matches
  const foundPrices: Array<{ price: number; currency: string }> = []

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      // Remove commas and parse
      const priceStr = match[1].replace(/,/g, '')
      const price = parseFloat(priceStr)
      
      // Validate price is reasonable and not a placeholder
      // Reject prices over £100,000 and specifically reject 999999 (common placeholder)
      if (!isNaN(price) && price >= 0.01 && price <= 100000 && price !== 999999) {
        // Determine currency
        let currency = 'GBP' // Default to GBP for UK
        if (text.includes('£') || /GBP|pound/i.test(text)) currency = 'GBP'
        else if (text.includes('€') || /EUR|euro/i.test(text)) currency = 'EUR'
        else if (text.includes('$') || /USD|dollar/i.test(text)) currency = 'USD'
        
        foundPrices.push({ price, currency })
      }
    }
  }

  // Return the lowest price found (most likely the actual price)
  if (foundPrices.length > 0) {
    foundPrices.sort((a, b) => a.price - b.price)
    return foundPrices[0]
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
          // Parse price - SerpAPI returns prices as strings like "$29.99" or "£52.95"
          const priceStr = item.price.replace(/[^0-9.]/g, '')
          const price = parseFloat(priceStr)
          
          // Validate price is reasonable
          if (!isNaN(price) && price >= 0.01 && price <= 100000 && price !== 999999) {
            // Determine currency from price string or use item currency
            let currency = item.currency || 'GBP'
            if (item.price.includes('£')) currency = 'GBP'
            else if (item.price.includes('€')) currency = 'EUR'
            else if (item.price.includes('$')) currency = 'USD'
            
            results.push({
              retailer: item.source || 'Unknown',
              price: price,
              currency: currency,
              product_url: item.link,
              product_title: item.title,
              image_url: item.thumbnail,
              in_stock: item.in_stock !== false,
            })
          }
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

