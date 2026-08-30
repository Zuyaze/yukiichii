'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface HeroImage {
  id: number
  image_url: string
  alt_text: string | null
}

interface HeroCarouselProps {
  images: HeroImage[]
  autoPlayMs?: number
  showArrows?: boolean
  showDots?: boolean
  pauseOnHover?: boolean
}

export function HeroCarousel({
  images,
}: HeroCarouselProps) {
  if (images.length === 0) {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden ring-1 ring-border bg-gradient-to-br from-primary/10 to-primary/5" />
    )
  }

  if (images.length === 1) {
    const image = images[0]
    return (
      <Link href="/apps" className="block relative aspect-video rounded-2xl overflow-hidden ring-1 ring-border hover:ring-primary/50 transition-all">
        <img
          src={image.image_url}
          alt={image.alt_text || 'Hero'}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </Link>
    )
  }

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden ring-1 ring-border">
      <Link href="/apps" className="block relative aspect-video overflow-hidden">
        <img
          src={images[0].image_url}
          alt={images[0].alt_text || 'Hero'}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </Link>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
            YukiiChii × Zuyaze
          </p>
          <p className="text-lg md:text-xl text-white/90 mt-2 drop-shadow">
            Kumpulan Mod Apk & Loader Gratis Terbaru
          </p>
          <Link href="/apps" className="inline-block mt-6 px-8 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold hover:bg-white/30 transition-colors">
            Jelajahi Aplikasi
          </Link>
        </div>
      </div>
    </div>
  )
}