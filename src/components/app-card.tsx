'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface AppCardProps {
  slug: string
  title: string
  description: string | null
  download_url: string
  screenshot_url: string | null
  category_name: string | null
  category_color: string
  category_slug: string | null
  tags: { name: string; color: string; slug: string }[]
}

export function AppCard({
  slug,
  title,
  description,
  download_url,
  screenshot_url,
  category_name,
  category_color,
  category_slug,
  tags,
}: AppCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
      <Link href={`/apps/${slug}`} className="block relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
        {screenshot_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={screenshot_url}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {category_name && (
          <span className="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: category_color }}>
            {category_name}
          </span>
        )}
      </Link>

      <CardContent className="flex-1 p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 flex-1 min-w-0">{title}</h3>
        </div>

        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.slice(0, 3).map(tag => (
              <Badge key={tag.slug} variant="secondary" className="text-xs" style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}>
                {tag.name}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">+{tags.length - 3}</Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <a
          href={download_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full"
        >
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="lg">
            <Download className="w-4 h-4 mr-2" />
            DOWNLOAD
          </Button>
        </a>
      </CardFooter>
    </Card>
  )
}