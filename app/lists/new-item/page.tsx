'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NavbarClient } from '@/components/navbar-client'

export default function NewItemPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
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

      // Get user's wish list
      const { data: wishList, error: wishListError } = await supabase
        .from('wish_lists')
        .select('id')
        .eq('user_id', user.id)
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
            console.error('Upload error:', uploadError)
            if (uploadError.message.includes('Bucket') || uploadError.message.includes('not found')) {
              throw new Error('Storage bucket not configured. Please create the "wish-list-images" bucket in Supabase Storage, or add the item without an image.')
            }
            // If it's a policy/permission error, allow continuing without image
            if (uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
              console.warn('Image upload failed due to permissions, continuing without image')
              imageUrl = null // Don't set imageUrl, continue without it
            } else {
              throw uploadError
            }
          }

          const {
            data: { publicUrl },
          } = supabase.storage.from('wish-list-images').getPublicUrl(fileName)
          imageUrl = publicUrl
        } catch (uploadErr: any) {
          // If bucket doesn't exist or permission error, allow continuing without image
          if (uploadErr.message.includes('Bucket') || uploadErr.message.includes('not found')) {
            setError('Image upload failed: Storage bucket not configured. You can still add the item without an image, or set up the storage bucket in Supabase.')
            setLoading(false)
            return
          }
          // If it's a permission/policy error, continue without image
          if (uploadErr.message.includes('policy') || uploadErr.message.includes('permission')) {
            console.warn('Image upload failed due to permissions, continuing without image')
            imageUrl = null // Continue without image
          } else {
            throw uploadErr
          }
        }
      }

      // Create wish list item
      const { data: insertedItem, error: insertError } = await supabase
        .from('wish_list_items')
        .insert({
          wish_list_id: wishList.id,
          creator_id: user.id,
          title,
          description: description || null,
          link_url: linkUrl || null,
          image_url: imageUrl,
          is_hidden_from_owner: false,
        })
        .select()
        .single()

      if (insertError) {
        console.error('Insert error:', insertError)
        // Provide more helpful error message
        if (insertError.message.includes('row-level security') || insertError.code === '42501') {
          throw new Error('Permission denied. Please make sure you are logged in and the database policies are set up correctly.')
        }
        throw insertError
      }

      router.push('/dashboard')
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
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Add New Item</h2>

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
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link
                href="/dashboard"
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

