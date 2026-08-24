'use client'

import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, X, Filter, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchFilterProps {
  categories: { name: string; slug: string; color: string }[]
  tags: { name: string; slug: string; color: string }[]
  initialSearch?: string
  initialCategory?: string
  initialTags?: string[]
  onSearch: (params: { search: string; category: string; tags: string[] }) => void
}

export function SearchFilter({ categories, tags, initialSearch, initialCategory, initialTags, onSearch }: SearchFilterProps) {
  const [search, setSearch] = useState(initialSearch || '')
  const [category, setCategory] = useState(initialCategory || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags || [])
  const [showTags, setShowTags] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const debouncedSearch = useCallback(
    debounce((params: { search: string; category: string; tags: string[] }) => {
      if (mounted) {
        onSearch(params)
      }
    }, 300),
    [onSearch, mounted]
  )

  useEffect(() => {
    if (mounted) {
      debouncedSearch({ search, category, tags: selectedTags })
    }
  }, [search, category, selectedTags, debouncedSearch, mounted])

  const toggleTag = (tagSlug: string) => {
    setSelectedTags(prev => prev.includes(tagSlug) ? prev.filter(t => t !== tagSlug) : [...prev, tagSlug])
  }

  const clearAll = () => {
    setSearch('')
    setCategory('')
    setSelectedTags([])
  }

  const hasFilters = search || category || selectedTags.length > 0

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Input placeholder="Cari aplikasi..." className="pl-10 pr-10" disabled />
        </div>
        <div className="space-y-2">
          <select disabled className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
            <option value="">Semua Kategori</option>
          </select>
          <Button type="button" variant="outline" size="sm" className="w-full justify-between" disabled>
            <span className="flex items-center gap-2">Tag (0)</span>
          </Button>
        </div>
      </div>
    )
  }

  const handleSearch = (params: { search: string; category: string; tags: string[] }) => {
    if (typeof window !== 'undefined') {
      onSearch(params)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari aplikasi..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setSearch('')}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Semua Kategori</option>
          {categories.map(cat => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>

        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-between"
            onClick={() => setShowTags(!showTags)}
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Tag ({selectedTags.length})
            </span>
            <ChevronDown className={cn('w-4 h-4 transition-transform', showTags && 'rotate-180')} />
          </Button>

          {showTags && (
            <div className="mt-2 flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded dark:border-gray-700">
              {tags.map(tag => (
                <button
                  key={tag.slug}
                  type="button"
                  onClick={() => toggleTag(tag.slug)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-full transition-colors',
                    selectedTags.includes(tag.slug)
                      ? 'font-medium text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    selectedTags.includes(tag.slug) && `bg-[${tag.color}]`
                  )}
                  style={selectedTags.includes(tag.slug) ? { backgroundColor: tag.color } : {}}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasFilters && (
          <Button type="button" variant="ghost" size="sm" className="w-full" onClick={clearAll}>
            <X className="w-4 h-4 mr-2" />
            Hapus Filter
          </Button>
        )}
      </div>
    </div>
  )
}

function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): T {
  let timeoutId: ReturnType<typeof setTimeout>
  return ((...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), ms)
  }) as T
}