import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { WishListItem } from '@/types'
import { saveUserAction, unsaveUserAction } from './actions'
import { PurchaseButton } from './purchase-button'
import { Navbar } from '@/components/navbar'
import { PriceComparison } from '@/components/price-comparison'
import { DeleteItemButton } from '@/app/lists/delete/[itemId]/client-delete'

interface PageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function ViewWishListPage({ params }: PageProps) {
  const { userId } = await params
  const supabase = await createClient()
  
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect('/auth/login')
  }

  // Get the user whose list we're viewing
  const { data: listOwner, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (userError || !listOwner) {
    console.error('Error fetching user:', userError)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">User not found</h2>
          <p className="text-sm text-gray-500 mb-4">
            {userError?.message || 'The user you are looking for does not exist.'}
          </p>
          <Link href="/search" className="text-blue-600 hover:text-blue-500">
            Search for users
          </Link>
        </div>
      </div>
    )
  }

  // Get wish list
  const { data: wishList } = await supabase
    .from('wish_lists')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!wishList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Wish list not found</h2>
        </div>
      </div>
    )
  }

  // Get wish list items
  // If viewing own list, exclude hidden items. Otherwise, show all items.
  const isOwnList = currentUser.id === userId
  let itemsQuery = supabase
    .from('wish_list_items')
    .select(`
      *,
      purchases (*)
    `)
    .eq('wish_list_id', wishList.id)
    .order('created_at', { ascending: false })

  if (isOwnList) {
    itemsQuery = itemsQuery.eq('is_hidden_from_owner', false)
  }

  const { data: items } = await itemsQuery

  // Check if user is saved
  const { data: savedUser } = await supabase
    .from('saved_users')
    .select('id')
    .eq('user_id', currentUser.id)
    .eq('saved_user_id', userId)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {listOwner.name}'s Wish List
              </h2>
              <p className="text-sm text-gray-500">{listOwner.email}</p>
            </div>
            {!isOwnList && (
              <form action={savedUser ? unsaveUserAction : saveUserAction}>
                <input type="hidden" name="userId" value={userId} />
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {savedUser ? 'Unsave' : 'Save User'}
                </button>
              </form>
            )}
            {!isOwnList && (
              <Link
                href={`/lists/${userId}/add-item`}
                className="ml-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Add Secret Item
              </Link>
            )}
          </div>

          {items && items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(items as any[]).map((item: WishListItem & { purchases?: any[] | any }) => {
                // Check if item has been purchased
                // Purchases can be an array or a single object depending on Supabase query
                const purchases = item.purchases
                const purchaseData = Array.isArray(purchases) ? purchases[0] : purchases
                const isPurchased = purchases && (
                  (Array.isArray(purchases) && purchases.length > 0) ||
                  (typeof purchases === 'object' && purchases.id)
                )
                const purchaserId = purchaseData?.purchaser_id
                
                // Hide purchase status when viewing your own list (keep it a surprise!)
                const showPurchaseStatus = !isOwnList && isPurchased
                const canEdit = item.creator_id === currentUser.id
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg p-6 shadow relative ${
                      showPurchaseStatus 
                        ? 'bg-gray-50 border-2 border-green-500 opacity-75' 
                        : 'bg-white border-2 border-transparent'
                    }`}
                  >
                    <div className="absolute top-2 right-2 flex gap-2">
                      {showPurchaseStatus && (
                        <div className="rounded-full bg-green-500 text-white p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {canEdit && (
                        <>
                          <Link
                            href={`/lists/edit/${item.id}`}
                            className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
                            title="Edit item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <DeleteItemButton itemId={item.id} itemTitle={item.title} />
                        </>
                      )}
                    </div>
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className={`mb-4 h-48 w-full rounded-md object-cover ${
                          showPurchaseStatus ? 'opacity-50 grayscale' : ''
                        }`}
                      />
                    )}
                    <h3 className={`text-lg font-semibold ${
                      showPurchaseStatus ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className={`mt-2 text-sm ${
                        showPurchaseStatus ? 'line-through text-gray-400' : 'text-gray-600'
                      }`}>
                        {item.description}
                      </p>
                    )}
                    {showPurchaseStatus && (
                      <div className="mt-3 rounded-md bg-green-100 border border-green-300 px-3 py-2 text-sm font-medium text-green-800">
                        ✓ Already Purchased
                      </div>
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
                    {!isOwnList && (
                      <div className="mt-4">
                        <PurchaseButton 
                          userId={userId} 
                          itemId={item.id} 
                          isPurchased={isPurchased}
                          purchaserId={purchaserId}
                          currentUserId={currentUser.id}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-6 text-center shadow">
              <p className="text-gray-500">This wish list is empty.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

