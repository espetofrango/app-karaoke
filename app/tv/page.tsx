'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { QRCodeSVG } from 'qrcode.react'
import { Music, Users, Mic2, Play, Pause } from 'lucide-react'
import { db, type QueueItem } from '@/lib/firebase'
import { ref, onValue, update } from 'firebase/database'

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-black">
      <div className="text-neon-pink animate-pulse">Carregando player...</div>
    </div>
  ),
})

export default function TVPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [currentVideo, setCurrentVideo] = useState<QueueItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const remoteUrl = 'https://app-karaoke-weld.vercel.app/remote'

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

  // Quando a fila muda e não tem vídeo tocando, prepara o primeiro mas não inicia automaticamente
  useEffect(() => {
    if (!currentVideo && queue.length > 0) {
      console.log('Setting current video:', queue[0])
      setCurrentVideo(queue[0])
      setIsPlaying(false) // Não inicia automaticamente devido às restrições de autoplay
      setHasUserInteracted(false) // Reset interaction state for new video
    }
  }, [queue, currentVideo])

  const handleVideoEnd = async () => {
    if (currentVideo) {
      // Marca como concluído no Realtime Database
      const itemRef = ref(db, `fila/${currentVideo.id}`)
      await update(itemRef, { status: 'concluido' })

      setCurrentVideo(null)
      setIsPlaying(false)
    }
  }

  const upcomingQueue = queue.filter((item) => item.id !== currentVideo?.id)

  return (
    <div className="flex h-screen bg-karaoke-dark overflow-hidden">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-karaoke-darker border-b border-neon-pink/20">
          <div className="flex items-center gap-3">
            <Mic2 className="w-8 h-8 text-neon-pink" />
            <h1 className="text-2xl font-bold text-white">
              <span className="text-neon-pink">Karaoke</span> Pro
            </h1>
          </div>
          {currentVideo && (
            <div className="flex items-center gap-2 text-neon-cyan">
              <Users className="w-5 h-5" />
              <span className="text-sm">{currentVideo.nome}</span>
            </div>
          )}
        </header>

        {/* Video Player */}
        <div className="flex-1 relative bg-black">
          {currentVideo ? (
            <>
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${currentVideo.youtube_id}`}
                playing={hasUserInteracted && isPlaying}
                controls
                width="100%"
                height="100%"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleVideoEnd}
                onError={(error) => {
                  console.error('Player error:', error)
                  handleVideoEnd()
                }}
                config={{
                  youtube: {
                    playerVars: {
                      autoplay: 0,
                      modestbranding: 1,
                      rel: 0,
                      showinfo: 0,
                      disablekb: 1,
                      fs: 0,
                    },
                  },
                }}
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                <button
                  onClick={() => {
                    console.log('Button clicked, toggling playback')
                    if (!hasUserInteracted) {
                      setHasUserInteracted(true)
                      setIsPlaying(true)
                    } else {
                      setIsPlaying(!isPlaying)
                    }
                  }}
                  className="bg-neon-pink hover:bg-neon-pink/80 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      {hasUserInteracted ? 'Continuar' : 'Reproduzir'}
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-6">
              <div className="relative">
                <Music className="w-24 h-24 text-neon-pink animate-pulse" />
                <div className="absolute inset-0 blur-xl bg-neon-pink/30 rounded-full" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Aguardando pedidos
                </h2>
                <p className="text-gray-400">
                  Escaneie o QR Code para adicionar uma musica
                </p>
              </div>
            </div>
          )}

          {/* Instruções para o usuário da TV */}
          {currentVideo && !hasUserInteracted && (
            <div className="absolute top-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg">
              <p className="text-sm text-center">
                🎵 Música pronta! Clique no botão rosa "Reproduzir" para iniciar a apresentação
              </p>
            </div>
          )}
        </div>

        {/* Now Playing Bar */}
        {currentVideo && (
          <div className="px-6 py-4 bg-karaoke-darker border-t border-neon-pink/20">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
              <span className="text-gray-400 text-sm">Tocando agora:</span>
              <span className="text-white font-medium truncate flex-1">
                {currentVideo.musica}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-80 bg-karaoke-darker border-l border-neon-pink/20 flex flex-col">
        {/* QR Code Section */}
        <div className="p-6 border-b border-neon-pink/20">
          <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
            Controle Remoto
          </h3>
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-white rounded-lg shadow-neon-pink">
              <QRCodeSVG
                value={remoteUrl}
                size={140}
                bgColor="#ffffff"
                fgColor="#0f0f0f"
                level="H"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Escaneie para pedir sua musica
            </p>
          </div>
        </div>

        {/* Queue Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b border-neon-pink/20">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Music className="w-4 h-4" />
              Fila de Espera ({upcomingQueue.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {upcomingQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
                <Music className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm text-center">
                  A fila esta vazia. Seja o proximo a cantar!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-neon-pink/10">
                {upcomingQueue.map((item, index) => (
                  <li
                    key={item.id}
                    className="px-4 py-3 hover:bg-neon-pink/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-pink/20 text-neon-pink text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {item.musica}
                        </p>
                        <p className="text-xs text-neon-cyan mt-1">
                          {item.nome}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
