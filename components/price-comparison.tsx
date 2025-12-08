'use client'

import { useState } from 'react'
import { WishListItem } from '@/types'

interface PriceComparison {
  retailer: string
  price: number
  currency: string
  product_url: string
  product_title: string
  image_url?: string
  in_stock: boolean
}

interface PriceComparisonProps {
  item: WishListItem
}

export function PriceComparison({ item }: PriceComparisonProps) {
  const [prices, setPrices] = useState<PriceComparison[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showComparison, setShowComparison] = useState(false)

  const [provider, setProvider] = useState<string | null>(null)

  const handleComparePrices = async () => {
    setLoading(true)
    setError(null)
    setShowComparison(true)
    setProvider(null)

    try {
      // First check which provider is configured
      const configResponse = await fetch('/api/check-price-config')
      if (configResponse.ok) {
        const configData = await configResponse.json()
        setProvider(configData.provider || 'unknown')
      }

      const response = await fetch('/api/search-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to search prices')
      }

      const data = await response.json()
      setPrices(data.prices || [])
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price)
  }

  if (!showComparison) {
    return (
      <button
        onClick={handleComparePrices}
        className="mt-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Searching...' : '💰 Compare Prices'}
      </button>
    )
  }

  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Price Comparison</h4>
          {provider && (
            <p className="text-xs text-gray-500 mt-0.5">
              Using: <span className="font-medium">{provider === 'serpapi' ? 'SerpAPI' : provider === 'google' ? 'Google Custom Search' : provider}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setShowComparison(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {loading && (
        <div className="py-4 text-center text-sm text-gray-500">
          Searching for prices...
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
          {error.includes('not configured') && (
            <p className="mt-2 text-xs text-red-600">
              Please set up Google API or SerpAPI in environment variables.
            </p>
          )}
        </div>
      )}

      {!loading && !error && prices.length === 0 && (
        <div className="py-4 text-center text-sm text-gray-500">
          No prices found for this product.
        </div>
      )}

      {!loading && !error && prices.length > 0 && (
        <div className="space-y-2">
          {prices.slice(0, 5).map((price, index) => (
            <div
              key={`${price.retailer}-${index}`}
              className={`flex items-center justify-between rounded-md p-2 ${
                index === 0
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">
                    {price.retailer}
                  </span>
                  {index === 0 && (
                    <span className="rounded bg-green-600 px-1.5 py-0.5 text-xs font-medium text-white">
                      Best Price
                    </span>
                  )}
                </div>
                {price.product_title && (
                  <p className="mt-1 text-xs text-gray-600 line-clamp-1">
                    {price.product_title}
                  </p>
                )}
              </div>
              <div className="ml-4 text-right">
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(price.price, price.currency)}
                </div>
                {!price.in_stock && (
                  <div className="text-xs text-red-600">Out of stock</div>
                )}
              </div>
              <a
                href={price.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                View →
              </a>
            </div>
          ))}
          {prices.length > 5 && (
            <p className="pt-2 text-center text-xs text-gray-500">
              Showing top 5 of {prices.length} results
            </p>
          )}
        </div>
      )}
    </div>
  )
}

