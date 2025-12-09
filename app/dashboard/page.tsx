import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { PriceComparison } from '@/components/price-comparison'
import { DeleteAccountButton } from '@/app/auth/delete-account/client-delete'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get user's wish list
  const { data: wishList } = await supabase
    .from('wish_lists')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get wish list items (excluding hidden items for own list)
  // Don't fetch purchases for your own list - keep it a surprise!
  const { data: items } = await supabase
    .from('wish_list_items')
    .select('*')
    .eq('wish_list_id', wishList?.id || '')
    .eq('is_hidden_from_owner', false)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {wishList?.title || 'My Wish List'}
            </h2>
            <Link
              href="/lists/new-item"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add Item
            </Link>
          </div>

          {items && items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(items as any[]).map((item: any) => {
                // Don't show purchase status on your own list (keep it a surprise!)
                return (
                  <div
                    key={item.id}
                    className="rounded-lg bg-white p-6 shadow border-2 border-transparent"
                  >
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="mb-4 h-48 w-full rounded-md object-cover"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {item.description}
                      </p>
                    )}
                    {item.link_url && (
                      <a
                        href={item.affiliate_link || item.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-500"
                      >
                        View Product →
                      </a>
                    )}
                    <div className="mt-4">
                      <PriceComparison item={item} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 shadow">
              <p className="text-gray-500">
                Your wish list is empty. Start by adding your first item!
              </p>
              <Link
                href="/lists/new-item"
                className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Your First Item
              </Link>
            </div>
          )}

          {/* Account Settings Section */}
          <div className="mt-12 rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Account Settings</h3>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Delete Account</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <DeleteAccountButton />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

