'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppGrid } from '@/components/app-grid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, X, Filter, ChevronDown, ArrowRight, Download, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppData {
  id: number
  slug: string
  title: string
  description: string | null
  download_url: string
  category_id: number | null
  created_at: string
  updated_at: string
  category_name: string | null
  category_slug: string | null
  category_color: string
  tags: { name: string; color: string; slug: string }[]
}

interface Category {
  id: number
  name: string
  slug: string
  color: string
  icon: string | null
  sort_order: number
  created_at: string
}

interface Tag {
  id: number
  name: string
  slug: string
  color: string
  created_at: string
}

export default function AppsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [apps, setApps] = useState<AppData[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [selectedTags, setSelectedTags] = useState<string[]>(searchParams.get('tag') ? [searchParams.get('tag')!] : [])
  const [showTags, setShowTags] = useState(false)
  const [page, setPage] = useState(1)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      if (selectedTags.length > 0) params.set('tag', selectedTags[0])
      params.set('limit', '20')
      params.set('offset', String((page - 1) * 20))

      const [appsRes, categoriesRes, tagsRes] = await Promise.all([
        fetch(`/api/apps?${params.toString()}`).then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/tags').then(r => r.json()),
      ])
      setApps(appsRes.apps || [])
      setCategories(categoriesRes.categories || [])
      setTags(tagsRes.tags || [])
    } catch (err) {
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [search, category, selectedTags, page])

  const debouncedSearch = (value: string) => {
    const timeout = setTimeout(() => setSearch(value), 300)
    return () => clearTimeout(timeout)
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)()
    setSearch(e.target.value)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
    setPage(1)
  }

  const toggleTag = (tagSlug: string) => {
    setSelectedTags(prev => prev.includes(tagSlug) ? prev.filter(t => t !== tagSlug) : [...prev, tagSlug])
    setPage(1)
  }

  const clearAll = () => {
    setSearch('')
    setCategory('')
    setSelectedTags([])
    setPage(1)
  }

  const hasFilters = search || category || selectedTags.length > 0

  const debounce = (fn: () => void, ms: number) => {
    let timeoutId: ReturnType<typeof setTimeout>
    return () => { clearTimeout(timeoutId); timeoutId = setTimeout(fn, ms) }
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Semua Aplikasi</h1>
          <p className="text-muted-foreground mt-2">Temukan aplikasi dan tools yang kamu butuhkan</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Cari aplikasi..." value={search} onChange={e => {setSearch(e.target.value); setPage(1)}} className="pl-10 pr-10 w-full h-10 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  {search && <button type="button" onClick={() => {setSearch(''); setPage(1)}} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                </div>
                <div className="space-y-2">
                  <select value={category} onChange={e => {setCategory(e.target.value); setPage(1)}} className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="">Semua Kategori</option></select>
                  <div>
                    <button type="button" onClick={() => setShowTags(!showTags)} className="w-full justify-between h-10 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"><span className="flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17a1 1 0 01-1 1H6a1 1 0 01-1-1v-3.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>Tag (0)</span><svg className="w-4 h-4 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></button>
                  </div>
                </div>
                {hasFilters && <button type="button" onClick={clearAll} className="w-full h-10 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Hapus Filter</button>}
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Menampilkan 0 aplikasi</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <p className="col-span-full text-center text-muted-foreground py-12">Memuat...</p>
          </div>
        </main>
      </div>
    </div>
  )
}

interface Category { id: number; name: string; slug: string; color: string; icon: string | null; sort_order: number; created_at: string }
interface Tag { id: number; name: string; slug: string; color: string; created_at: string }
interface AppData { id: number; slug: string; title: string; description: string | null; download_url: string; category_id: number | null; created_at: string; updated_at: string; category_name: string | null; category_slug: string | null; category_color: string; tags: { name: string; color: string; slug: string }[] }