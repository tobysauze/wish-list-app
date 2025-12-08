import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { User } from '@/types'
import { Navbar } from '@/components/navbar'

export default async function SavedUsersPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get saved users
  const { data: savedUsers } = await supabase
    .from('saved_users')
    .select(`
      id,
      saved_user_id,
      created_at,
      saved_user:users!saved_users_saved_user_id_fkey (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Saved Wish Lists</h2>

          {savedUsers && savedUsers.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {savedUsers.map((saved: any) => {
                const savedUser = saved.saved_user as User
                return (
                  <div key={saved.id} className="rounded-lg bg-white p-6 shadow">
                    <h3 className="text-lg font-semibold text-gray-900">{savedUser.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{savedUser.email}</p>
                    {savedUser.phone && (
                      <p className="text-sm text-gray-500">{savedUser.phone}</p>
                    )}
                    <Link
                      href={`/lists/${savedUser.id}`}
                      className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      View Wish List
                    </Link>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <p className="text-gray-500 mb-4">You haven't saved any users yet.</p>
              <Link
                href="/search"
                className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Search for Users
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


