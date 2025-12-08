/**
 * Product Title Extractor
 * 
 * Extracts the actual product title from product URLs (Amazon, eBay, etc.)
 * This provides more accurate titles for price comparison searches
 */

interface ExtractResult {
  title: string | null
  description: string | null
  error?: string
}

/**
 * Extract product title from a URL
 */
export async function extractProductTitle(url: string): Promise<ExtractResult> {
  if (!url || !isValidUrl(url)) {
    return { title: null, description: null, error: 'Invalid URL' }
  }

  try {
    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })

    if (!response.ok) {
      return { title: null, description: null, error: `Failed to fetch: ${response.status}` }
    }

    const html = await response.text()

    // Try different extraction methods based on the domain
    const domain = new URL(url).hostname.toLowerCase()

    if (domain.includes('amazon.')) {
      return extractAmazonTitle(html)
    } else if (domain.includes('ebay.')) {
      return extractEbayTitle(html)
    } else if (domain.includes('argos.') || domain.includes('currys.') || domain.includes('johnlewis.')) {
      return extractGenericTitle(html)
    } else {
      // Generic extraction for other sites
      return extractGenericTitle(html)
    }
  } catch (error: any) {
    console.error('Error extracting product title:', error)
    return { title: null, description: null, error: error.message }
  }
}

/**
 * Extract title from Amazon product page
 */
function extractAmazonTitle(html: string): ExtractResult {
  // Amazon uses several possible selectors for product title
  const patterns = [
    /<span[^>]*id="productTitle"[^>]*>([\s\S]*?)<\/span>/i,
    /<h1[^>]*class="[^"]*product-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h1[^>]*data-automation-id="title"[^>]*>([\s\S]*?)<\/h1>/i,
    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
    /<title>([\s\S]*?)<\/title>/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      const title = cleanHtml(match[1])
      if (title && title.length > 10) { // Reasonable title length
        return { title, description: null }
      }
    }
  }

  return { title: null, description: null, error: 'Could not extract Amazon title' }
}

/**
 * Extract title from eBay product page
 */
function extractEbayTitle(html: string): ExtractResult {
  const patterns = [
    /<h1[^>]*id="x-item-title-label"[^>]*>([\s\S]*?)<\/h1>/i,
    /<h1[^>]*class="[^"]*it-ttl[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
    /<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i,
    /<title>([\s\S]*?)(?:\s*[-|]\s*eBay)?<\/title>/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      const title = cleanHtml(match[1])
      if (title && title.length > 10) {
        return { title, description: null }
      }
    }
  }

  return { title: null, description: null, error: 'Could not extract eBay title' }
}

/**
 * Generic title extraction using common patterns
 */
function extractGenericTitle(html: string): ExtractResult {
  // Try Open Graph meta tag first (most reliable)
  const ogTitleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i)
  if (ogTitleMatch && ogTitleMatch[1]) {
    return { title: cleanHtml(ogTitleMatch[1]), description: null }
  }

  // Try JSON-LD structured data
  const jsonLdMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1])
      if (jsonLd.name || jsonLd.title) {
        return { title: jsonLd.name || jsonLd.title, description: jsonLd.description || null }
      }
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // Try h1 tags
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1Match && h1Match[1]) {
    const title = cleanHtml(h1Match[1])
    if (title && title.length > 10 && title.length < 200) {
      return { title, description: null }
    }
  }

  // Fallback to page title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i)
  if (titleMatch && titleMatch[1]) {
    const title = cleanHtml(titleMatch[1])
    // Remove common suffixes like " - Amazon.co.uk"
    const cleaned = title.replace(/\s*[-|]\s*(Amazon|eBay|Argos|Currys|John Lewis).*$/i, '').trim()
    if (cleaned && cleaned.length > 10) {
      return { title: cleaned, description: null }
    }
  }

  return { title: null, description: null, error: 'Could not extract title' }
}

/**
 * Clean HTML entities and tags from text
 */
function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, '') // Remove other HTML entities
    .trim()
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

