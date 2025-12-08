import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface RouteParams {
  params: Promise<{
    userId: string
    itemId: string
  }>
}

export async function POST(request: Request, { params }: RouteParams) {
  const { userId, itemId } = await params
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Get the purchase record
  const { data: purchase } = await supabase
    .from('purchases')
    .select('*')
    .eq('item_id', itemId)
    .single()

  if (!purchase) {
    return new Response(JSON.stringify({ error: 'Purchase not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Check if the current user is the purchaser
  if (purchase.purchaser_id !== user.id) {
    return new Response(JSON.stringify({ error: 'You can only unmark items you purchased' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Delete the purchase record
  const { error, data: deletedData } = await supabase
    .from('purchases')
    .delete()
    .eq('id', purchase.id)
    .select()

  if (error) {
    console.error('Error deleting purchase:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.log('Purchase deleted successfully:', deletedData)

  // Revalidate the page to show updated purchase status
  revalidatePath(`/lists/${userId}`)
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

