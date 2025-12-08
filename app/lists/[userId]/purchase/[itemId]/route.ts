import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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

  // Check if item is already purchased
  const { data: existingPurchase } = await supabase
    .from('purchases')
    .select('id')
    .eq('item_id', itemId)
    .single()

  if (existingPurchase) {
    // Already purchased, return success
    revalidatePath(`/lists/${userId}`)
    return new Response(JSON.stringify({ success: true, message: 'Already purchased' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Create purchase record
  const { error, data } = await supabase.from('purchases').insert({
    item_id: itemId,
    purchaser_id: user.id,
  }).select()

  if (error) {
    console.error('Error creating purchase:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Revalidate the page to show updated purchase status
  revalidatePath(`/lists/${userId}`)
  
  return new Response(JSON.stringify({ success: true, purchase: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}


