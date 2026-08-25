'use client'

import Link from 'next/link'
import { Download } from 'lucide-react'

interface AppCardProps {
  slug: string
  title: string
  description?: string | null
  download_url?: string
  screenshot_url?: string | null
  icon_url?: string | null
  category_name?: string | null
  category_color?: string
  category_slug?: string | null
  tags?: { name: string; color: string; slug: string }[]
}

export function AppCard({
  slug,
  title,
  icon_url,
  screenshot_url,
  category_name,
  category_color,
}: AppCardProps) {
  const image = icon_url || screenshot_url

  return (
    <Link href={`/apps/${slug}`} className="group block">
      {/* Logo */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted ring-1 ring-border group-hover:ring-primary/50 transition-all">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/15 to-primary/5">
            <span className="text-2xl font-bold text-primary/60">
              {title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Category badge */}
        {category_name && (
          <span
            className="absolute top-1 left-1 px-1.5 py-0.5 text-[9px] font-bold rounded-md"
            style={{
              backgroundColor: `${category_color || '#3b82f6'}E6`,
              color: '#fff',
            }}
          >
            {category_name}
          </span>
        )}

        {/* Free pill */}
        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[8px] font-black rounded bg-green-500 text-white tracking-wide">
          FREE
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-[10px] text-green-600 dark:text-green-400 font-semibold mt-0.5 flex items-center gap-0.5">
        <Download className="w-2.5 h-2.5" />
        GRATIS
      </p>
    </Link>
  )
}