/**
 * Fetch price directly from product page
 * Used as fallback when price isn't found in search snippet
 */

interface PriceResult {
  price: number
  currency: string
}

/**
 * Fetch price from a product page URL
 */
export async function fetchPriceFromPage(url: string): Promise<PriceResult | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) {
      return null
    }

    const html = await response.text()
    const domain = new URL(url).hostname.toLowerCase()

    // Try different extraction methods based on domain
    if (domain.includes('manomano.')) {
      return extractManoManoPrice(html)
    } else if (domain.includes('amazon.')) {
      return extractAmazonPrice(html)
    } else if (domain.includes('ebay.')) {
      return extractEbayPrice(html)
    } else {
      return extractGenericPrice(html)
    }
  } catch (error) {
    console.error('Error fetching price from page:', error)
    return null
  }
}

/**
 * Extract price from ManoMano page
 */
function extractManoManoPrice(html: string): PriceResult | null {
  // ManoMano price patterns
  const patterns = [
    /<span[^>]*class="[^"]*price[^"]*"[^>]*>.*?£\s*(\d+\.?\d*)/i,
    /"price"\s*:\s*"?(\d+\.?\d*)"?/i,
    /£\s*(\d+\.?\d*)/g,
  ]

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const price = parseFloat(match[1])
      if (price > 0 && price < 100000) {
        return { price, currency: 'GBP' }
      }
    }
  }

  return null
}

/**
 * Extract price from Amazon page
 */
function extractAmazonPrice(html: string): PriceResult | null {
  const patterns = [
    /<span[^>]*id="priceblock_[^"]*"[^>]*>.*?£\s*(\d+\.?\d*)/i,
    /"price"\s*:\s*"?(\d+\.?\d*)"?/i,
    /£\s*(\d+\.?\d*)/g,
  ]

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const price = parseFloat(match[1])
      if (price > 0 && price < 100000) {
        return { price, currency: 'GBP' }
      }
    }
  }

  return null
}

/**
 * Extract price from eBay page
 */
function extractEbayPrice(html: string): PriceResult | null {
  const patterns = [
    /<span[^>]*id="prcIsum"[^>]*>.*?£\s*(\d+\.?\d*)/i,
    /"price"\s*:\s*"?(\d+\.?\d*)"?/i,
    /£\s*(\d+\.?\d*)/g,
  ]

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const price = parseFloat(match[1])
      if (price > 0 && price < 100000) {
        return { price, currency: 'GBP' }
      }
    }
  }

  return null
}

/**
 * Generic price extraction
 */
function extractGenericPrice(html: string): PriceResult | null {
  // Look for common price patterns
  const patterns = [
    /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
    /"price"\s*:\s*"?(\d+\.?\d*)"?/i,
    /price[:\s]*£\s*(\d+\.?\d*)/i,
  ]

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      const priceStr = match[1].replace(/,/g, '')
      const price = parseFloat(priceStr)
      if (price > 0 && price < 100000) {
        return { price, currency: 'GBP' }
      }
    }
  }

  return null
}

