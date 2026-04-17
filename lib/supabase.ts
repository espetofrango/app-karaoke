import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('Ambiente de execução:', typeof window === 'undefined' ? 'Server/Node' : 'Browser/Client')
console.log('Valor de NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)

let finalUrl = supabaseUrl
let finalKey = supabaseAnonKey

if (!supabaseUrl || URL.canParse?.(supabaseUrl) === false) {
  const errMsg = 'ATENÇÃO: A URL do Supabase está vazia, ausente ou inválida. Verifique o Painel da Vercel!'
  console.error(errMsg)
  if (typeof window !== 'undefined') alert(errMsg)
  // Fallback falso só para o createClient não quebrar a página com erro de "Invalid URL"
  finalUrl = 'https://link-invalido-para-nao-quebrar.supabase.co'
}

export const supabase = createClient(finalUrl, finalKey)

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
