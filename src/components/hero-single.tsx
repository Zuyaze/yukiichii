'use client'

import Link from 'next/link'

interface HeroImage {
  id: number
  image_url: string
  alt_text: string | null
}

interface HeroSingleProps {
  images: HeroImage[]
}

export function HeroSingle({ images }: HeroSingleProps) {
  // Empty state - single clean placeholder
  if (images.length === 0) {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-border" />
    )
  }

  // Show only the first image (latest by sort_order)
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