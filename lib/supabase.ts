import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jwlyhgpjfpgkopjmjwp.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3bHloZ3BjamZwZ2tvcGptandwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMDE5NzAsImV4cCI6MjA5MTg3Nzk3MH0.NC8Zf5dfEiY7YtRxh2IvzEZGG4Q0T5pNcLGzSU6YAWY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface QueueItem {
  id: string
  video_id: string
  video_title: string
  video_thumbnail: string
  channel_name: string
  requested_by: string
  created_at: string
  played: boolean
}

export interface YouTubeSearchResult {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
}
