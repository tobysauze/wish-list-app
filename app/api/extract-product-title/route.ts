import { NextRequest, NextResponse } from 'next/server'
import { extractProductTitle } from '@/lib/product-extractor'

/**
 * API route to extract product title from a URL
 * 
 * Usage: POST /api/extract-product-title
 * Body: { url: string }
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

    const result = await extractProductTitle(url)

    if (result.error) {
      return NextResponse.json(
        { error: result.error, title: null },
        { status: 400 }
      )
    }

    return NextResponse.json({
      title: result.title,
      description: result.description,
    })
  } catch (error: any) {
    console.error('Error extracting product title:', error)
    return NextResponse.json(
      { error: 'Failed to extract product title', title: null },
      { status: 500 }
    )
  }
}

