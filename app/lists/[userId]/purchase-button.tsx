'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PurchaseButtonProps {
  userId: string
  itemId: string
  isPurchased: boolean
  purchaserId?: string
  currentUserId: string
}

export function PurchaseButton({ userId, itemId, isPurchased, purchaserId, currentUserId }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handlePurchase = async () => {
    setLoading(true)
    try {
      const url = isPurchased 
        ? `/lists/${userId}/unpurchase/${itemId}`
        : `/lists/${userId}/purchase/${itemId}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        // Force a hard refresh to ensure data is reloaded
        window.location.reload()
      } else {
        const errorText = await response.text()
        console.error(`Failed to ${isPurchased ? 'unmark' : 'mark'} as purchased:`, errorText)
        try {
          const errorJson = JSON.parse(errorText)
          alert(`Failed: ${errorJson.error || errorText}`)
        } catch {
          alert(`Failed to ${isPurchased ? 'unmark' : 'mark'} item as purchased. Please try again.`)
        }
      }
    } catch (error) {
      console.error(`Error ${isPurchased ? 'unmarking' : 'marking'} as purchased:`, error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // If purchased, only show button if current user is the purchaser
  if (isPurchased) {
    if (purchaserId === currentUserId) {
      return (
        <button
          onClick={handlePurchase}
          disabled={loading}
          className="w-full rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Unmarking...' : 'Unmark as Purchased'}
        </button>
      )
    }
    return null
  }

  return (
    <button
      onClick={handlePurchase}
      disabled={loading}
      className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? 'Marking...' : 'Mark as Purchased'}
    </button>
  )
}

