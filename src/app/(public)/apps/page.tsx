'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Search, X, Filter, ChevronDown } from 'lucide-react'

interface Category { id: number; name: string; slug: string; color: string }
interface Tag { id: number; name: string; slug: string; color: string }

export default function AppsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTags, setShowTags] = useState(false)
  const [page, setPage] = useState(1)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeout = setTimeout(() => setSearch(e.target.value), 300)
    return () => clearTimeout(timeout)
  }

  const handleCategoryChange = (value: string) => {
    setCategory(value)
  }

  const toggleTag = (tagSlug: string) => {
    setSelectedTags(prev => prev.includes(tagSlug) ? prev.filter(t => t !== tagSlug) : [...prev, tagSlug])
  }

  const clearAll = () => {
    setSearch('')
    setCategory('')
    setSelectedTags([])
  }

  const hasFilters = false

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-100 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Semua Aplikasi</h1>
          <p className="text-gray-500 mt-2">Temukan aplikasi dan tools yang kamu butuhkan</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Cari aplikasi..." className="pl-10 pr-10 w-full h-10 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="space-y-2">
                  <select className="w-full h-10 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="">Semua Kategori</option></select>
                  <div>
                    <button type="button" className="w-full justify-between h-10 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"><span className="flex items-center gap-2">Tag (0)</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}