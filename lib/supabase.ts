import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = 'https://yarxcejyvtstxmqtpiux.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhcnhjZWp5dnRzdHhtcXRwaXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTA0MDQsImV4cCI6MjA5MjAyNjQwNH0.bbHAl-tZub254gqEF7N9KWLQa26ufrXri-_qglHaM2A'

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
