'use client'

import { AppCard } from './app-card'

interface AppGridProps {
  apps: Array<{
    slug: string
    title: string
    description: string | null
    download_url: string
    screenshot_url: string | null
    category_name: string | null
    category_color: string
    category_slug: string | null
    tags: { name: string; color: string; slug: string }[]
  }>
  emptyMessage?: string
}

export function AppGrid({ apps, emptyMessage = 'Belum ada aplikasi' }: AppGridProps) {
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {apps.map(app => (
        <AppCard key={app.slug} {...app} />
      ))}
    </div>
  )
}