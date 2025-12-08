import { NextRequest, NextResponse } from 'next/server'
import { convertToAffiliateLink, getAffiliateConfig } from '@/lib/affiliate'
import { createClient } from '@/lib/supabase/server'

/**
 * API route to convert a URL to an affiliate link
 * This can be called when a user adds an item
 */
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Get affiliate configuration
    const config = getAffiliateConfig()

    // Convert to affiliate link
    const affiliateUrl = await convertToAffiliateLink(url, config)

    // Optionally cache the conversion in the database
    const supabase = await createClient()
    const { data: existing } = await supabase
      .from('affiliate_links')
      .select('affiliate_url')
      .eq('original_url', url)
      .single()

    if (!existing) {
      // Store in cache for future use
      const domain = new URL(url).hostname
      await supabase.from('affiliate_links').insert({
        original_url: url,
        affiliate_url: affiliateUrl,
        domain: domain,
      })
    }

    return NextResponse.json({
      original_url: url,
      affiliate_url: affiliateUrl,
    })
  } catch (error) {
    console.error('Error converting affiliate link:', error)
    return NextResponse.json(
      { error: 'Failed to convert affiliate link' },
      { status: 500 }
    )
  }
}

