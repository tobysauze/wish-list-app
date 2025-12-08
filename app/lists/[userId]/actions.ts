'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveUser(userId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.id === userId) {
    return { error: 'Invalid operation' }
  }

  const { error } = await supabase.from('saved_users').insert({
    user_id: user.id,
    saved_user_id: userId,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/lists/${userId}`)
  return { success: true }
}

export async function unsaveUser(userId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('saved_users')
    .delete()
    .eq('user_id', user.id)
    .eq('saved_user_id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/lists/${userId}`)
  return { success: true }
}


