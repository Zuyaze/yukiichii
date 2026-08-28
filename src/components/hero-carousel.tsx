'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(true)

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

    const container = emblaRef.current?.parentElement
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

  if (images.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-border flex items-center justify-center"
          >
            <div className="text-center p-4 text-primary/60">
              <span className="text-4xl font-bold">Y×Z</span>
              <p className="text-xs mt-1">Demo Gallery</p>
              <p className="text-[10px] text-muted-foreground">Tambah gambar di Admin → Hero Gallery</p>
            </div>
          </div>
        ))}
      </div>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4">
          <div className="w-full text-white text-center">
            {image.alt_text && <p className="text-sm font-medium mb-1">{image.alt_text}</p>}
            <p className="text-xs text-white/80">Jelajahi aplikasi →</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="relative" ref={emblaRef}>
      <div className="overflow-hidden">
        <div className="flex" style={{ transform: 'translateX(0)' }}>
          {images.map((image, index) => (
            <div
              key={image.id}
              className="flex-[0_0_100%] min-w-0"
              style={{ width: '100%' }}
            >
              <Link
                href="/apps"
                className="block relative aspect-video rounded-2xl overflow-hidden ring-1 ring-border hover:ring-primary/50 transition-all"
              >
                <img
                  src={image.image_url}
                  alt={image.alt_text || `Hero ${index + 1}`}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end p-4">
                  <div className="w-full text-white text-center">
                    {image.alt_text && <p className="text-sm font-medium mb-1">{image.alt_text}</p>}
                    <p className="text-xs text-white/80">Jelajahi aplikasi →</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {showArrows && (
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