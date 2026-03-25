import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string
          hunter_rank: string
          level: number
          current_xp: number
          total_xp: number
          total_tasks_completed: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          difficulty: string
          xp_value: number
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      daily_quests: {
        Row: {
          id: string
          user_id: string
          quest_text: string
          current_streak: number
          last_completed_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_quests']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['daily_quests']['Insert']>
      }
      daily_completions: {
        Row: {
          id: string
          daily_quest_id: string
          user_id: string
          completed_date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_completions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['daily_completions']['Insert']>
      }
    }
  }
}
