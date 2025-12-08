/**
 * Affiliate Link Conversion Service
 * 
 * This service converts regular product links to affiliate links.
 * 
 * Options:
 * 1. Skimlinks API - Supports 60,000+ merchants automatically
 * 2. VigLink API - Similar to Skimlinks
 * 3. Amazon Associates API - For Amazon products only
 * 
 * For now, we'll implement a basic version that can be extended with API keys.
 */

interface AffiliateConfig {
  provider: 'skimlinks' | 'viglink' | 'amazon' | 'manual'
  apiKey?: string
  siteId?: string
}

/**
 * Convert a regular product URL to an affiliate link
 */
export async function convertToAffiliateLink(
  originalUrl: string,
  config?: AffiliateConfig
): Promise<string> {
  if (!originalUrl || !isValidUrl(originalUrl)) {
    return originalUrl
  }

  // Check if it's already an affiliate link
  if (isAffiliateLink(originalUrl)) {
    return originalUrl
  }

  const provider = config?.provider || 'manual'

  try {
    switch (provider) {
      case 'skimlinks':
        return await convertWithSkimlinks(originalUrl, config?.apiKey)
      
      case 'viglink':
        return await convertWithVigLink(originalUrl, config?.apiKey, config?.siteId)
      
      case 'amazon':
        return await convertAmazonLink(originalUrl, config?.apiKey)
      
      case 'manual':
      default:
        // Manual conversion - you can add your own affiliate IDs here
        return convertManually(originalUrl)
    }
  } catch (error) {
    console.error('Error converting affiliate link:', error)
    // Return original URL if conversion fails
    return originalUrl
  }
}

/**
 * Convert using Skimlinks API
 * Sign up at: https://skimlinks.com/
 */
async function convertWithSkimlinks(url: string, apiKey?: string): Promise<string> {
  if (!apiKey) {
    console.warn('Skimlinks API key not configured')
    return url
  }

  // Skimlinks API endpoint
  const response = await fetch('https://api-reports.skimlinks.com/publisher/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      url: url,
      format: 'json',
    }),
  })

  if (!response.ok) {
    throw new Error(`Skimlinks API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.affiliate_url || url
}

/**
 * Convert using VigLink API
 * Sign up at: https://www.viglink.com/
 */
async function convertWithVigLink(url: string, apiKey?: string, siteId?: string): Promise<string> {
  if (!apiKey || !siteId) {
    console.warn('VigLink API key or site ID not configured')
    return url
  }

  // VigLink API endpoint
  const response = await fetch('https://api.viglink.com/api/product', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
      apiKey: apiKey,
      siteId: siteId,
    }),
  })

  if (!response.ok) {
    throw new Error(`VigLink API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.url || url
}

/**
 * Convert Amazon links using Amazon Associates
 * Sign up at: https://affiliate-program.amazon.com/
 */
function convertAmazonLink(url: string, associateTag?: string): string {
  if (!associateTag) {
    console.warn('Amazon Associates tag not configured')
    return url
  }

  try {
    const urlObj = new URL(url)
    
    // Only convert amazon.com, amazon.co.uk, etc.
    if (!urlObj.hostname.includes('amazon.')) {
      return url
    }

    // Add or replace the tag parameter
    urlObj.searchParams.set('tag', associateTag)
    
    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * Manual conversion - add your own affiliate IDs here
 * This is a simple example you can customize
 */
function convertManually(url: string): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()

    // Example: Amazon Associates
    // Replace 'your-tag-20' with your actual Amazon Associates tag
    if (hostname.includes('amazon.')) {
      urlObj.searchParams.set('tag', 'your-tag-20')
      return urlObj.toString()
    }

    // Example: Add more retailers here
    // if (hostname.includes('target.com')) {
    //   urlObj.searchParams.set('ref', 'your-affiliate-id')
    //   return urlObj.toString()
    // }

    // Return original if no conversion rule matches
    return url
  } catch {
    return url
  }
}

/**
 * Check if URL is already an affiliate link
 */
function isAffiliateLink(url: string): boolean {
  const affiliatePatterns = [
    /tag=/i,
    /ref=/i,
    /affiliate/i,
    /aff=/i,
    /partner/i,
    /campaign=/i,
  ]

  return affiliatePatterns.some(pattern => pattern.test(url))
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

/**
 * Get affiliate configuration from environment variables
 */
export function getAffiliateConfig(): AffiliateConfig {
  // Check for Skimlinks
  if (process.env.SKIMLINKS_API_KEY) {
    return {
      provider: 'skimlinks',
      apiKey: process.env.SKIMLINKS_API_KEY,
    }
  }

  // Check for VigLink
  if (process.env.VIGLINK_API_KEY && process.env.VIGLINK_SITE_ID) {
    return {
      provider: 'viglink',
      apiKey: process.env.VIGLINK_API_KEY,
      siteId: process.env.VIGLINK_SITE_ID,
    }
  }

  // Check for Amazon Associates
  if (process.env.AMAZON_ASSOCIATE_TAG) {
    return {
      provider: 'amazon',
      apiKey: process.env.AMAZON_ASSOCIATE_TAG,
    }
  }

  // Default to manual
  return {
    provider: 'manual',
  }
}

