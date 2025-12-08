import { NextRequest, NextResponse } from 'next/server'
import { searchPrices, searchPricesWithSerpAPI, getPriceComparisonConfig } from '@/lib/price-comparison'
import { createClient } from '@/lib/supabase/server'

/**
 * API route to search for product prices
 * 
 * Usage: POST /api/search-prices
 * Body: { itemId: string, query?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { itemId, query } = await request.json()

    if (!itemId) {
      return NextResponse.json(
        { error: 'itemId is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get the wish list item
    const { data: item, error: itemError } = await supabase
      .from('wish_list_items')
      .select('title, description, link_url')
      .eq('id', itemId)
      .single()

    if (itemError || !item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check if we have cached prices (less than 24 hours old)
    // Filter out invalid/placeholder prices
    const { data: cachedPrices } = await supabase
      .from('price_comparisons')
      .select('*')
      .eq('item_id', itemId)
      .gte('last_updated', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('price', { ascending: true })
      .limit(10)

    // Filter out invalid prices (999999, over 100000, etc.)
    const validCachedPrices = cachedPrices?.filter(
      (p: any) => p.price >= 0.01 && p.price <= 100000 && p.price !== 999999
    ) || []

    // If we have fresh cached prices, return them (only valid ones)
    if (validCachedPrices.length > 0) {
      return NextResponse.json({
        prices: validCachedPrices,
        cached: true,
      })
    }

    // Build search query optimized for shopping results
    // If we have a link, try to extract better title from it first
    let searchTitle = item.title
    if (item.link_url && (!item.title || item.title.length < 20)) {
      try {
        const extractResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/extract-product-title`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: item.link_url }),
        })
        if (extractResponse.ok) {
          const extractData = await extractResponse.json()
          if (extractData.title && extractData.title.length > item.title.length) {
            searchTitle = extractData.title
          }
        }
      } catch (err) {
        console.error('Error extracting title for search:', err)
        // Continue with original title
      }
    }
    
    // Add shopping-related keywords to improve results
    const baseQuery = query || `${searchTitle} ${item.description || ''}`.trim()
    
    // Try multiple search variations for better results
    const searchVariations = [
      `${baseQuery} buy price`,           // Best for shopping
      `${baseQuery} for sale`,            // Alternative
      `${baseQuery} shop`,                // Another variation
      baseQuery,                          // Original query as fallback
    ]
    
    // Use the first variation (most likely to find shopping results)
    const searchQuery = searchVariations[0]

    // Get price comparison config
    const config = getPriceComparisonConfig()

    if (!config) {
      return NextResponse.json(
        { error: 'Price comparison API not configured. Please set up Google API or SerpAPI.' },
        { status: 500 }
      )
    }

    // Search for prices
    let priceResults
    if (config.provider === 'serpapi') {
      priceResults = await searchPricesWithSerpAPI(searchQuery, config.apiKey)
    } else {
      priceResults = await searchPrices({
        query: searchQuery,
        apiKey: config.apiKey,
        maxResults: 10,
      })
    }

    if (priceResults.length === 0) {
      return NextResponse.json({
        prices: [],
        message: 'No prices found for this product',
      })
    }

    // Filter out invalid prices before storing
    const validPriceResults = priceResults.filter(
      (p) => p.price >= 0.01 && p.price <= 100000 && p.price !== 999999
    )

    // Store results in database (only valid prices)
    const priceInserts = validPriceResults.map(price => ({
      item_id: itemId,
      retailer: price.retailer,
      price: price.price,
      currency: price.currency,
      product_url: price.product_url,
      product_title: price.product_title,
      image_url: price.image_url,
      in_stock: price.in_stock,
    }))

    // Use upsert to avoid duplicates
    if (priceInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('price_comparisons')
        .upsert(priceInserts, {
          onConflict: 'item_id,retailer,product_url',
        })

      if (insertError) {
        console.error('Error storing price comparisons:', insertError)
        // Still return results even if storage fails
      }
    }

    // Also delete any existing invalid prices for this item
    await supabase
      .from('price_comparisons')
      .delete()
      .eq('item_id', itemId)
      .or('price.gte.100000,price.eq.999999,price.lt.0.01')

    return NextResponse.json({
      prices: validPriceResults,
      cached: false,
    })
  } catch (error) {
    console.error('Error searching prices:', error)
    return NextResponse.json(
      { error: 'Failed to search prices' },
      { status: 500 }
    )
  }
}

