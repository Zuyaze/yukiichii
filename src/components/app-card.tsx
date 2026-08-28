'use client'

import Link from 'next/link'
import { Download } from 'lucide-react'

interface AppCardProps {
  slug: string
  title: string
  icon_url?: string | null
  screenshot_url?: string | null
  category_name?: string | null
  category_color?: string
  variant?: 'grid' | 'horizontal'
  className?: string
}

export function AppCard({
  slug,
  title,
  icon_url,
  screenshot_url,
  category_name,
  category_color,
  variant = 'grid',
  className = '',
}: AppCardProps) {
  const image = icon_url || screenshot_url
  const baseClasses = 'group block flex-shrink-0'
  const variantClasses = variant === 'horizontal' 
    ? 'w-28' 
    : ''

  return (
    <Link href={`/apps/${slug}`} className={`${baseClasses} ${variantClasses} ${className}`}>
      <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/15 to-primary/5">
            <span className="text-2xl font-bold text-primary/60">{title.charAt(0).toUpperCase()}</span>
          </div>
        )}
        {category_name && (
          <span
            className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-bold rounded-md"
            style={{ backgroundColor: `${category_color || '#3b82f6'}E6`, color: '#fff' }}
          >
            {category_name}
          </span>
        )}
        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[8px] font-black rounded bg-green-500 text-white">GRATIS</span>
      </div>
      <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
        {title}
      </p>
    </Link>
  )
}