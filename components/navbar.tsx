import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { LogoutButton } from '@/app/auth/logout/client-logout'

export async function Navbar() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Wish List App
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                My Wish List
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Search Users
              </Link>
              <Link
                href="/saved"
                className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
              >
                Saved Lists
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700">{profile?.name || user.email}</span>
            <div className="ml-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

