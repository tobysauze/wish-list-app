export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          phone?: string | null
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      wish_lists: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      wish_list_items: {
        Row: {
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
        }
        Insert: {
          id?: string
          wish_list_id: string
          creator_id: string
          title: string
          description?: string | null
          image_url?: string | null
          link_url?: string | null
          affiliate_link?: string | null
          is_hidden_from_owner?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wish_list_id?: string
          creator_id?: string
          title?: string
          description?: string | null
          image_url?: string | null
          link_url?: string | null
          affiliate_link?: string | null
          is_hidden_from_owner?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          item_id: string
          purchaser_id: string
          purchased_at: string
        }
        Insert: {
          id?: string
          item_id: string
          purchaser_id: string
          purchased_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          purchaser_id?: string
          purchased_at?: string
        }
      }
      saved_users: {
        Row: {
          id: string
          user_id: string
          saved_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          saved_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          saved_user_id?: string
          created_at?: string
        }
      }
      affiliate_links: {
        Row: {
          id: string
          original_url: string
          affiliate_url: string
          domain: string
          created_at: string
        }
        Insert: {
          id?: string
          original_url: string
          affiliate_url: string
          domain: string
          created_at?: string
        }
        Update: {
          id?: string
          original_url?: string
          affiliate_url?: string
          domain?: string
          created_at?: string
        }
      }
    }
  }
}


