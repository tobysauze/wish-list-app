import { NextRequest, NextResponse } from 'next/server'
import { analyzeProductImage, getVisionApiConfig } from '@/lib/image-search'

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

    // Get API configuration (tries Gemini > Vision API)
    const config = getVisionApiConfig()

    console.log('Image analysis API config:', {
      hasConfig: !!config,
      provider: config?.provider,
      hasApiKey: !!config?.apiKey,
    })

    if (!config) {
      return NextResponse.json(
        { 
          error: 'No image analysis API configured',
          hint: 'Add GOOGLE_GEMINI_API_KEY (recommended for best results) or GOOGLE_VISION_API_KEY to Vercel environment variables',
        },
        { status: 500 }
      )
    }

    const result = await analyzeProductImage(imageBase64, config.apiKey, config.provider as any)
    
    console.log('Image analysis result:', {
      hasProductName: !!result.productName,
      productName: result.productName,
      hasDescription: !!result.description,
      method: result.method,
      hasError: !!result.error,
    })

    if (result.error) {
      // Log the error for debugging
      console.error('Image analysis error:', {
        provider: config.provider,
        error: result.error,
        method: result.method,
      })
      
      // Return 200 with error info (don't fail the request, let user continue)
      return NextResponse.json({
        error: result.error,
        ...result,
      })
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

