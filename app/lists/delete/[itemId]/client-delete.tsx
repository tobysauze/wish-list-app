'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteItemButtonProps {
  itemId: string
  itemTitle: string
}

export function DeleteItemButton({ itemId, itemTitle }: DeleteItemButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/lists/delete/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete item')
      }

      // Item deleted successfully, refresh the page
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the item')
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
        title="Delete item"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Delete Item
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold">"{itemTitle}"</span>? This action cannot be undone.
            </p>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsOpen(false)
                  setError(null)
                }}
                disabled={isDeleting}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
