import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://jwlyhgpcjfpgkopjmjwp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3bHloZ3BjamZwZ2tvcGptandwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMDE5NzAsImV4cCI6MjA5MTg3Nzk3MH0.NC8Zf5dfEiY7YtRxh2IvzEZGG4Q0T5pNcLGzSU6YAWY'

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
