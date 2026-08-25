'use client'

import Link from 'next/link'
import { Download } from 'lucide-react'

interface AppCardProps {
  slug: string
  title: string
  description?: string | null
  download_url?: string
  screenshot_url: string | null
  category_name?: string | null
  category_color?: string
  category_slug?: string | null
  tags?: { name: string; color: string; slug: string }[]
}

export function AppCard({
  slug,
  title,
  screenshot_url,
  category_name,
  category_color,
}: AppCardProps) {
  return (
    <Link href={`/apps/${slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
        {screenshot_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshot_url}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Download className="w-8 h-8 text-muted-foreground/40" />
          </div>
        )}

        {/* Category badge */}
        {category_name && (
          <span
            className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-md backdrop-blur-sm"
            style={{
              backgroundColor: `${category_color || '#3b82f6'}E6`,
              color: '#fff',
            }}
          >
            {category_name}
          </span>
        )}

        {/* Free pill */}
        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-green-500 text-white">
          FREE
        </span>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      </div>

      {/* Title */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          <Download className="w-3 h-3" />
          Mod · Gratis
        </p>
      </div>
    </Link>
  )
}