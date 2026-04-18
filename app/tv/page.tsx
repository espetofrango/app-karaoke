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
  const [hasInteracted, setHasInteracted] = useState(false)
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

  // Quando a fila muda e não tem vídeo tocando, toca o primeiro
  useEffect(() => {
    if (!currentVideo && queue.length > 0) {
      setCurrentVideo(queue[0])
      // Importante dar um pequeno delay para garantir que o player carregou antes de forçar o play
      setTimeout(() => setIsPlaying(true), 500)
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

  if (!hasInteracted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-karaoke-dark relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-neon-pink/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center max-w-md w-full p-8 bg-karaoke-darker/80 backdrop-blur-xl border border-neon-pink/30 rounded-2xl shadow-2xl shadow-neon-pink/20 text-center">
          <div className="relative mb-6">
            <Mic2 className="w-20 h-20 text-neon-pink animate-pulse" />
            <div className="absolute inset-0 bg-neon-pink/40 blur-2xl rounded-full" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-purple-500">
              Karaoke
            </span> Pro
          </h1>
          
          <p className="text-gray-400 mb-8 text-sm">
            Para garantir que a música toque automaticamente com som, os navegadores modernos exigem que você interaja com a página antes.
          </p>

          <button
            onClick={() => setHasInteracted(true)}
            className="w-full py-4 bg-gradient-to-r from-neon-pink to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(255,42,133,0.4)] hover:shadow-[0_0_30px_rgba(255,42,133,0.6)] transition-all flex items-center justify-center gap-2 group"
          >
            <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
            LIGAR A TV
          </button>
        </div>
      </div>
    )
  }

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
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${currentVideo.youtube_id}`}
              playing={isPlaying}
              controls
              width="100%"
              height="100%"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleVideoEnd}
              onError={(e) => {
                console.error("Erro no video: ", e)
                handleVideoEnd()
              }}
              config={{
                youtube: {
                  playerVars: {
                    autoplay: 1, // força o autoplay pelo proprio iframe do youtube
                    modestbranding: 1,
                  },
                },
              }}
            />
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
