'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Search, Plus, Mic2, Check, Loader2, User, X } from 'lucide-react'
import { db, type QueueItem, type YouTubeSearchResult } from '@/lib/firebase'
import { ref, push, onValue, update } from 'firebase/database'
import { searchYouTube } from '@/lib/youtube'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function RemotePage() {
  const [userName, setUserName] = useState('')
  const [isNameSet, setIsNameSet] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const filaRef = ref(db, 'fila')

    const unsubscribe = onValue(filaRef, (snapshot) => {
      const data = snapshot.val()
      if (!data) {
        setQueue([])
        return
      }

      const items: QueueItem[] = Object.entries(data)
        .map(([key, value]: [string, any]) => ({
          id: key,
          youtube_id: value.youtube_id,
          musica: value.musica,
          nome: value.nome,
          status: value.status,
          created_at: value.created_at,
        }))
        .filter((item) => item.status === 'pendente')
        .sort((a, b) => a.created_at - b.created_at)

      setQueue(items)
    })

    return () => unsubscribe()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const results = await searchYouTube(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Erro na busca:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const addToQueue = async (video: YouTubeSearchResult) => {
    setAddingId(video.id)

    try {
      const filaRef = ref(db, 'fila')
      await push(filaRef, {
        youtube_id: video.id,
        musica: video.title,
        nome: userName,
        status: 'pendente',
        created_at: Date.now(),
      })

      setAddedIds((prev) => new Set(prev).add(video.id))
    } catch (err: any) {
      console.error('Erro ao inserir no Firebase:', err)
      alert('Erro no Firebase: ' + err.message)
    } finally {
      setAddingId(null)
    }
  }

  const removeFromQueue = async (itemId: string, videoId: string) => {
    try {
      const itemRef = ref(db, `fila/${itemId}`)
      await update(itemRef, { status: 'removido' })

      setAddedIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(videoId)
        return newSet
      })
    } catch (err: any) {
      console.error('Erro ao remover da fila:', err)
      alert('Erro ao remover: ' + err.message)
    }
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      setIsNameSet(true)
    }
  }

  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-karaoke-dark flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
          <div className="relative mb-6 mx-auto w-24 h-24 rounded-full overflow-hidden border-2 border-neon-pink/30 shadow-[0_0_20px_rgba(255,42,133,0.4)]">
            <img src="/logo.jpg" alt="Pulando Demais" className="w-full h-full object-cover" />
          </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              <span className="text-neon-pink">Karaoke</span> Pro
            </h1>
            <p className="text-gray-400">Informe seu nome para continuar</p>
          </div>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input
                type="text"
                placeholder="Seu nome"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="pl-10 bg-karaoke-darker border-neon-pink/30 text-white placeholder:text-gray-500 focus:border-neon-pink focus:ring-neon-pink/20 h-12"
              />
            </div>
            <Button
              type="submit"
              disabled={!userName.trim()}
              className="w-full h-12 bg-neon-pink hover:bg-neon-pink/80 text-white font-semibold"
            >
              Continuar
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-karaoke-dark">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-karaoke-darker border-b border-neon-pink/20 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Pulando Demais" className="w-8 h-8 rounded-full border border-neon-pink/50 shadow-[0_0_10px_rgba(255,42,133,0.3)] object-cover" />
            <h1 className="text-lg font-bold text-white">
              <span className="text-neon-pink">Karaoke</span> Pro
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-neon-cyan" />
            <span className="text-neon-cyan">{userName}</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Buscar musica..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-9 bg-karaoke-dark border-neon-pink/30 text-white placeholder:text-gray-500 focus:border-neon-pink focus:ring-neon-pink/20"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-neon-pink hover:bg-neon-pink/80 text-white px-4"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {/* Queue Status */}
        {queue.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <p className="text-sm text-neon-cyan">
              <span className="font-semibold">{queue.length}</span> musica(s) na
              fila
            </p>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Resultados
            </h2>
            <ul className="space-y-2">
              {searchResults.map((video) => {
                const isAdded = addedIds.has(video.id)
                const isAdding = addingId === video.id

                return (
                  <li
                    key={video.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-karaoke-darker border border-neon-pink/10 hover:border-neon-pink/30 transition-colors"
                  >
                    <div className="relative flex-shrink-0 w-24 h-16 rounded overflow-hidden">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium line-clamp-2">
                        {video.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {video.channelTitle}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addToQueue(video)}
                      disabled={isAdded || isAdding}
                      className={`flex-shrink-0 ${
                        isAdded
                          ? 'bg-neon-cyan/20 text-neon-cyan'
                          : 'bg-neon-pink hover:bg-neon-pink/80 text-white'
                      }`}
                    >
                      {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isAdded ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {/* Current Queue */}
        {queue.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Sua fila ({queue.length})
            </h2>
            <ul className="space-y-2">
              {queue.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-karaoke-darker border border-neon-cyan/10"
                >
                  <div className="relative flex-shrink-0 w-16 h-12 rounded overflow-hidden">
                    <Image
                      src={`https://img.youtube.com/vi/${item.youtube_id}/default.jpg`}
                      alt={item.musica}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium line-clamp-2">
                      {item.musica}
                    </p>
                    <p className="text-xs text-neon-cyan">
                      {item.nome}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFromQueue(item.id, item.youtube_id)}
                    className="flex-shrink-0 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">
              Busque uma musica
            </h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Digite o nome da musica ou artista no campo acima para encontrar
              videos de karaoke
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
