'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { NavbarClient } from '@/components/navbar-client'

export default function AddSecretItemPage() {
  const params = useParams()
  const userId = params.userId as string
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [analyzingImage, setAnalyzingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get the target user's wish list
      const { data: wishList, error: wishListError } = await supabase
        .from('wish_lists')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (wishListError || !wishList) {
        throw new Error('Wish list not found')
      }

      let imageUrl: string | null = null

      // Upload image if provided
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop()
          const fileName = `${user.id}/${Date.now()}.${fileExt}`
          const { error: uploadError } = await supabase.storage
            .from('wish-list-images')
            .upload(fileName, imageFile)

          if (uploadError) {
            if (uploadError.message.includes('Bucket') || uploadError.message.includes('not found')) {
              throw new Error('Storage bucket not configured. Please create the "wish-list-images" bucket in Supabase Storage, or add the item without an image.')
            }
            throw uploadError
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from('wish-list-images').getPublicUrl(fileName)
          imageUrl = publicUrl
        } catch (uploadErr: any) {
          // If bucket doesn't exist, allow continuing without image
          if (uploadErr.message.includes('Bucket') || uploadErr.message.includes('not found')) {
            setError('Image upload failed: Storage bucket not configured. You can still add the item without an image, or set up the storage bucket in Supabase.')
            setLoading(false)
            return
          }
          throw uploadErr
        }
      }

      // Convert link to affiliate link if provided
      let affiliateLink: string | null = null
      if (linkUrl) {
        try {
          const response = await fetch('/api/convert-affiliate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: linkUrl }),
          })
          if (response.ok) {
            const data = await response.json()
            affiliateLink = data.affiliate_url || linkUrl
          } else {
            // If conversion fails, use original link
            affiliateLink = linkUrl
          }
        } catch (err) {
          console.error('Error converting affiliate link:', err)
          // If conversion fails, use original link
          affiliateLink = linkUrl
        }
      }

      // Create secret wish list item (hidden from owner)
      const { error: insertError } = await supabase.from('wish_list_items').insert({
        wish_list_id: wishList.id,
        creator_id: user.id,
        title,
        description: description || null,
        link_url: linkUrl || null,
        affiliate_link: affiliateLink,
        image_url: imageUrl,
        is_hidden_from_owner: true, // This is a secret item
      })

      if (insertError) throw insertError

      router.push(`/lists/${userId}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarClient />

      <main className="mx-auto max-w-3xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-4 rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              This item will be hidden from the list owner but visible to other users.
            </p>
          </div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Add Secret Item</h2>

          <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="e.g., Red Scarf"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Additional details about the item..."
              />
            </div>

            <div>
              <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700">
                Link URL
              </label>
              <input
                id="linkUrl"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="https://example.com/product"
              />
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Image
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  setImageFile(file || null)
                  
                  // If image is selected and title is empty, try to identify product
                  if (file && !title.trim()) {
                    setAnalyzingImage(true)
                    setError(null)
                    
                    try {
                      // Convert image to base64
                      const reader = new FileReader()
                      reader.onload = async () => {
                        const base64 = reader.result as string
                        
                        try {
                          const response = await fetch('/api/analyze-image', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ imageBase64: base64 }),
                          })
                          
                          if (response.ok) {
                            const data = await response.json()
                            if (data.productName) {
                              setTitle(data.productName)
                              if (data.description && !description) {
                                setDescription(data.description)
                              }
                            } else {
                              setError('Could not identify product from image. Please enter a title manually.')
                            }
                          } else {
                            const errorData = await response.json()
                            if (errorData.error?.includes('not configured')) {
                              // Vision API not set up - that's okay, user can still add image
                              console.log('Vision API not configured, skipping image analysis')
                            } else {
                              setError('Failed to analyze image. You can still add the item manually.')
                            }
                          }
                        } catch (err) {
                          console.error('Error analyzing image:', err)
                          // Don't show error - user can still add item manually
                        } finally {
                          setAnalyzingImage(false)
                        }
                      }
                      reader.onerror = () => {
                        setAnalyzingImage(false)
                      }
                      reader.readAsDataURL(file)
                    } catch (err) {
                      setAnalyzingImage(false)
                    }
                  }
                }}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
              {analyzingImage && (
                <p className="mt-1 text-xs text-blue-600">
                  🔍 Analyzing image to identify product...
                </p>
              )}
              {imageFile && !analyzingImage && !title.trim() && (
                <p className="mt-1 text-xs text-gray-500">
                  💡 Tip: Enter a product name manually or wait for image analysis
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4">
              <Link
                href={`/lists/${userId}`}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Secret Item'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

