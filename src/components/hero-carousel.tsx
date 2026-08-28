'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
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
  autoPlayMs = 5000,
  showArrows = true,
  showDots = true,
  pauseOnHover = true,
}: HeroCarouselProps) {
  const shouldLoop = images.length > 2
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: shouldLoop, align: 'center', slidesToScroll: 1 })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const loadedCountRef = useRef(0)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    const onInit = () => setScrollSnaps(emblaApi.scrollSnapList())
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    const onReInit = () => setScrollSnaps(emblaApi.scrollSnapList())

    emblaApi.on('init', onInit)
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onReInit)

    onInit()

    return () => {
      emblaApi.off('init', onInit)
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onReInit)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi || !isPlaying || images.length <= 1) return

    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, autoPlayMs)

    return () => clearInterval(interval)
  }, [emblaApi, isPlaying, autoPlayMs, images.length])

  useEffect(() => {
    if (!pauseOnHover) return

    const container = emblaRef.current
    if (!container) return

    const handleMouseEnter = () => setIsPlaying(false)
    const handleMouseLeave = () => setIsPlaying(true)

    container.addEventListener('mouseenter', handleMouseEnter)
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [emblaRef, pauseOnHover])

  const handleImageLoad = useCallback(() => {
    loadedCountRef.current += 1
    if (loadedCountRef.current === images.length && emblaApi) {
      emblaApi.reInit()
    }
  }, [images.length, emblaApi])

  // Empty state - single placeholder card
  if (images.length === 0) {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-border flex items-center justify-center">
        <Link href="/dashboard/hero-gallery" className="text-center p-8 hover:bg-primary/5 transition-colors w-full h-full flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
            <Plus className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Belum ada Hero Gallery</h3>
          <p className="text-sm text-muted-foreground">Tambah gambar dari Admin → Hero Gallery</p>
        </Link>
      </div>
    )
  }

  // Single image - no carousel needed
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

  // 2+ images - Carousel
  return (
    <div className="relative w-full" ref={emblaRef}>
      <div className="embla__viewport overflow-hidden">
        <div className="embla__container flex">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="embla__slide flex-[0_0_100%] min-w-0 relative aspect-video"
            >
              <Link
                href="/apps"
                className="block relative aspect-video rounded-2xl overflow-hidden ring-1 ring-border hover:ring-primary/50 transition-all"
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Hero ${index + 1}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  onLoad={handleImageLoad}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {showArrows && images.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-lg ring-1 ring-border opacity-0 group-hover:opacity-100 transition-opacity',
              !emblaApi?.canScrollPrev() && 'hidden'
            )}
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-foreground shadow-lg ring-1 ring-border opacity-0 group-hover:opacity-100 transition-opacity',
              !emblaApi?.canScrollNext() && 'hidden'
            )}
            aria-label="Gambar selanjutnya"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {showDots && scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === selectedIndex
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
              )}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === selectedIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </div>
  )
}