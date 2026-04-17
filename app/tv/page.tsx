'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { QRCodeSVG } from 'qrcode.react'
import { Music, Users, Mic2 } from 'lucide-react'
import { supabase, type QueueItem } from '@/lib/supabase'

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
  const [remoteUrl, setRemoteUrl] = useState('')

  const fetchQueue = useCallback(async () => {
    const { data, error } = await supabase
      .from('fila')
      .select('*')
      .eq('status', 'pendente')
      .order('created_at', { ascending: true })

    if (!error && data) {
      setQueue(data)
      if (!currentVideo && data.length > 0) {
        setCurrentVideo(data[0])
        setIsPlaying(true)
      }
    }
  }, [currentVideo])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRemoteUrl(`${window.location.origin}/remote`)
    }
  }, [])

  useEffect(() => {
    fetchQueue()

    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fila' },
        () => {
          fetchQueue()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchQueue])

  const handleVideoEnd = async () => {
    if (currentVideo) {
      await supabase
        .from('fila')
        .update({ status: 'concluido' })
        .eq('id', currentVideo.id)

      const remainingQueue = queue.filter((item) => item.id !== currentVideo.id)

      if (remainingQueue.length > 0) {
        setCurrentVideo(remainingQueue[0])
        setQueue(remainingQueue)
        setIsPlaying(true)
      } else {
        setCurrentVideo(null)
        setQueue([])
        setIsPlaying(false)
      }
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
            <ReactPlayer
              url={`https://www.youtube.com/watch?v=${currentVideo.youtube_id}`}
              playing={isPlaying}
              controls
              width="100%"
              height="100%"
              onEnded={handleVideoEnd}
              onError={handleVideoEnd}
              config={{
                playerVars: {
                  autoplay: 1,
                  modestbranding: 1,
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
              {remoteUrl && (
                <QRCodeSVG
                  value={remoteUrl}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#0f0f0f"
                  level="H"
                />
              )}
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
