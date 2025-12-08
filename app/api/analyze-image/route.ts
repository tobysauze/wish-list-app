import { NextRequest, NextResponse } from 'next/server'
import { analyzeProductImage } from '@/lib/image-search'

/**
 * API route to analyze product image
 * 
 * Usage: POST /api/analyze-image
 * Body: { imageBase64: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json()

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { error: 'imageBase64 is required' },
        { status: 400 }
      )
    }

    // Get Vision API key
    const apiKey = process.env.GOOGLE_VISION_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'Google Vision API key not configured',
          hint: 'Add GOOGLE_VISION_API_KEY to Vercel environment variables',
        },
        { status: 500 }
      )
    }

    const result = await analyzeProductImage(imageBase64, apiKey)

    if (result.error) {
      return NextResponse.json(
        { error: result.error, ...result },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error analyzing image:', error)
    return NextResponse.json(
      { error: 'Failed to analyze image', details: error.message },
      { status: 500 }
    )
  }
}

