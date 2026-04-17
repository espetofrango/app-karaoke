import type { YouTubeSearchResult } from './supabase'

const YOUTUBE_API_KEY = 'AIzaSyDMqg24zb62YW2jdNPmC_b3qpxZg0ZJq6M'

export async function searchYouTube(query: string): Promise<YouTubeSearchResult[]> {
  if (!query.trim()) return []

  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('type', 'video')
  url.searchParams.set('maxResults', '10')
  url.searchParams.set('q', `${query} karaoke`)
  url.searchParams.set('key', YOUTUBE_API_KEY)

  const response = await fetch(url.toString())
  
  if (!response.ok) {
    throw new Error('Erro ao buscar vídeos')
  }

  const data = await response.json()

  return data.items.map((item: {
    id: { videoId: string }
    snippet: {
      title: string
      thumbnails: { medium: { url: string } }
      channelTitle: string
    }
  }) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
  }))
}
