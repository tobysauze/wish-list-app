'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'
import { NavbarClient } from '@/components/navbar-client'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'name' | 'email' | 'phone'>('name')
  const [results, setResults] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setError(null)

    try {
      let query = supabase.from('users').select('*')

      if (searchType === 'name') {
        query = query.ilike('name', `%${searchQuery}%`)
      } else if (searchType === 'email') {
        query = query.ilike('email', `%${searchQuery}%`)
      } else if (searchType === 'phone') {
        query = query.ilike('phone', `%${searchQuery}%`)
      }

      const { data, error: searchError } = await query.limit(20)

      if (searchError) throw searchError

      setResults(data || [])
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarClient />

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Search Users</h2>

          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'name' | 'email' | 'phone')}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${searchType}...`}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="rounded-lg bg-white shadow">
              <ul className="divide-y divide-gray-200">
                {results.map((user) => (
                  <li key={user.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/lists/${user.id}`}
                          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          View Wish List
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!loading && results.length === 0 && searchQuery && (
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <p className="text-gray-500">No users found. Try a different search term.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


