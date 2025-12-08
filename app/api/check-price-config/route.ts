import { NextResponse } from 'next/server'
import { getPriceComparisonConfig } from '@/lib/price-comparison'

/**
 * API route to check which price comparison provider is configured
 * Visit: /api/check-price-config
 */
export async function GET() {
  const config = getPriceComparisonConfig()

  if (!config) {
    return NextResponse.json({
      configured: false,
      message: 'No price comparison API configured',
      providers: {
        serpapi: !!process.env.SERPAPI_KEY,
        google: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),
      },
    })
  }

  return NextResponse.json({
    configured: true,
    provider: config.provider,
    message: `Using ${config.provider === 'serpapi' ? 'SerpAPI' : 'Google Custom Search'}`,
    hasApiKey: !!config.apiKey,
    providers: {
      serpapi: !!process.env.SERPAPI_KEY,
      google: !!(process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID),
    },
  })
}

