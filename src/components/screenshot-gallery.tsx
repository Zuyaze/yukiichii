'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface ScreenshotGalleryProps {
  screenshots: string[]
  title: string
}

export function ScreenshotGallery({ screenshots, title }: ScreenshotGalleryProps) {
  const [active, setActive] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  if (screenshots.length === 0) return null

  // Single image - no gallery needed
  if (screenshots.length === 1) {
    return (
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshots[0]}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  const scrollToIndex = useCallback((index: number) => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current
      const itemWidth = scrollContainer.clientWidth
      scrollContainer.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth'
      })
    }
    setActive(index)
  }, [])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    const scrollContainer = scrollRef.current
    const itemWidth = scrollContainer.clientWidth
    if (itemWidth === 0) return
    const newIndex = Math.round(scrollContainer.scrollLeft / itemWidth)
    if (newIndex !== active) {
      setActive(newIndex)
    }
  }, [active])

  // Multiple images - horizontal scroll gallery
  return (
    <div className="space-y-3">
      {/* Main image - horizontal scroll */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full overflow-x-auto scroll-snap-x snap-mandatory scrollbar-hide -ml-2 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {screenshots.map((url, i) => (
            <div key={i} className="flex-[0_0_100%] snap-start min-w-0 px-2" style={{ minWidth: '100%' }}>
              <img
                src={url}
                alt={`${title} screenshot ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Screenshot ${i + 1}`}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i === active ? 'bg-white' : 'bg-white/40'
              )}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
        {screenshots.map((url, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
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
    </div>
  )
}