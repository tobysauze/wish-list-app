import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

interface RouteParams {
  params: Promise<{
    itemId: string
  }>
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { itemId } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // Verify user owns this item
  const { data: item, error: fetchError } = await supabase
    .from('wish_list_items')
    .select('creator_id, wish_list_id')
    .eq('id', itemId)
    .single()

  if (fetchError || !item) {
    return NextResponse.json(
      { error: 'Item not found' },
      { status: 404 }
    )
  }

  if (item.creator_id !== user.id) {
    return NextResponse.json(
      { error: 'You can only delete items you created' },
      { status: 403 }
    )
  }

  // Delete the item (purchases will be cascade deleted automatically)
  const { error: deleteError } = await supabase
    .from('wish_list_items')
    .delete()
    .eq('id', itemId)

  if (deleteError) {
    console.error('Error deleting item:', deleteError)
    return NextResponse.json(
      { error: 'Failed to delete item. Please try again.' },
      { status: 500 }
    )
  }

  // Revalidate relevant paths
  revalidatePath('/dashboard')
  revalidatePath(`/lists/${item.wish_list_id}`)
  
  // Try to get user_id from wish_list_id to revalidate user's list page
  const { data: wishList } = await supabase
    .from('wish_lists')
    .select('user_id')
    .eq('id', item.wish_list_id)
    .single()
  
  if (wishList) {
    revalidatePath(`/lists/${wishList.user_id}`)
  }

  return NextResponse.json(
    { success: true },
    { status: 200 }
  )
}
