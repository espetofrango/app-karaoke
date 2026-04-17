import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCfVz-ZMZclJPdvVBaS5FAvbJ-olmjmWY4',
  authDomain: 'karaokeapp3.firebaseapp.com',
  projectId: 'karaokeapp3',
  storageBucket: 'karaokeapp3.firebasestorage.app',
  messagingSenderId: '806956431406',
  appId: '1:806956431406:web:82f69fafe0f511cc8e87bf',
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)

export interface QueueItem {
  id: string
  youtube_id: string
  musica: string
  nome: string
  status: string
  created_at: number
}

export interface YouTubeSearchResult {
  id: string
  title: string
  thumbnail: string
  channelTitle: string
}

// Force redeploy on Vercel - 2026-04-17
