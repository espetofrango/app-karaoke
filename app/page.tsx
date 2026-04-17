import Link from 'next/link'
import { Mic2, Tv, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-karaoke-dark flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="relative inline-block mb-6">
          <Mic2 className="w-20 h-20 text-neon-pink" />
          <div className="absolute inset-0 blur-xl bg-neon-pink/30 rounded-full" />
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">
          <span className="text-neon-pink">Karaoke</span> Pro
        </h1>
        <p className="text-gray-400 mb-10">
          Sistema de karaoke profissional
        </p>

        {/* Options */}
        <div className="space-y-4">
          <Link href="/tv" className="block">
            <Button
              variant="outline"
              className="w-full h-16 border-neon-pink/30 bg-karaoke-darker hover:bg-neon-pink/10 hover:border-neon-pink text-white group transition-all"
            >
              <Tv className="w-6 h-6 mr-3 text-neon-pink group-hover:scale-110 transition-transform" />
              <span className="text-lg">Interface da TV</span>
            </Button>
          </Link>

          <Link href="/remote" className="block">
            <Button
              className="w-full h-16 bg-neon-pink hover:bg-neon-pink/80 text-white group transition-all"
            >
              <Smartphone className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
              <span className="text-lg">Controle Remoto</span>
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="mt-10 text-xs text-gray-600">
          Abra a interface da TV em uma tela grande e use o controle remoto no celular
        </p>
      </div>
    </div>
  )
}
