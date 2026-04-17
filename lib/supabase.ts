import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface QueueItem {
  id: string
  youtube_id: string
  musica: string
  nome: string
  status: string
  created_at: string
}

export interface YouTubeSearchResult {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
}
