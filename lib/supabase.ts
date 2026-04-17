import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jwlyhgpcjfpgkopjmjwp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('Tentando conectar em:', supabaseUrl)
console.log('Ambiente de execução:', typeof window === 'undefined' ? 'Server/Node' : 'Browser/Client')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
})

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
