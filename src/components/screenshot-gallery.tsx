'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScreenshotGalleryProps {
  screenshots: string[]
  title: string
}

export function ScreenshotGallery({ screenshots, title }: ScreenshotGalleryProps) {
  const [active, setActive] = useState(0)

  if (screenshots.length === 0) return null

  const prev = () => setActive(a => (a - 1 + screenshots.length) % screenshots.length)
  const next = () => setActive(a => (a + 1) % screenshots.length)

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshots[active]}
          alt={`${title} screenshot ${active + 1}`}
          className="w-full h-full object-cover"
        />

        {screenshots.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Sebelumnya"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Selanjutnya"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Screenshot ${i + 1}`}
                  className={cn(
                    'w-2 h-2 rounded-full transition-colors',
                    i === active ? 'bg-white' : 'bg-white/40'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {screenshots.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
          {screenshots.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative aspect-video rounded-lg overflow-hidden border-2 transition-all',
                i === active
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${title} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}