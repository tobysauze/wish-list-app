// Re-export database types
export type { Database } from './database'

// Additional app-specific types
export interface WishListItem {
  id: string
  wish_list_id: string
  creator_id: string
  title: string
  description: string | null
  image_url: string | null
  link_url: string | null
  affiliate_link: string | null
  is_hidden_from_owner: boolean
  created_at: string
  updated_at: string
  purchase?: {
    id: string
    purchaser_id: string
    purchased_at: string
  } | null
}

export interface WishList {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  items?: WishListItem[]
}

export interface User {
  id: string
  email: string
  phone: string | null
  name: string
  created_at: string
  updated_at: string
}

export interface SavedUser {
  id: string
  user_id: string
  saved_user_id: string
  created_at: string
  saved_user?: User
}


