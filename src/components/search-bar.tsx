'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface Suggestion {
  id: number
  slug: string
  title: string
  icon_url: string | null
  screenshots: string[] | null
  category_name: string | null
}

export function SearchBar({ placeholder = 'Cari mod...' }: { placeholder?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced live search
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      setLoading(false)
      return
    }

    setLoading(true)
    clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/apps?search=${encodeURIComponent(query.trim())}&limit=5`)
        const data = await res.json()
        setSuggestions(data.apps || [])
        setShowDropdown(true)
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleSelect = (slug: string) => {
    setQuery('')
    setSuggestions([])
    setShowDropdown(false)
    router.push(`/apps/${slug}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input */}
      <form
        action="/apps"
        method="GET"
        onSubmit={e => {
          e.preventDefault()
          if (query.trim()) {
            setShowDropdown(false)
            router.push(`/apps?q=${encodeURIComponent(query.trim())}`)
          }
        }}
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowDropdown(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full h-12 pl-12 pr-10 text-sm bg-background text-foreground border border-input rounded-xl shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setShowDropdown(false)
            }}
            aria-label="Hapus pencarian"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Suggestions dropdown */}
      {showDropdown && (query.trim() || loading) && (
        <div className="absolute inset-x-0 top-full mt-2 z-50 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Loading indicator */}
          {loading && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Mencari...</div>
          )}

          {/* Results */}
          {!loading && suggestions.length > 0 && (
            <>
              {suggestions.map(app => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => handleSelect(app.slug)}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-muted transition-colors cursor-pointer"
                >
                  {/* Icon */}
                  {(app.icon_url || app.screenshots?.[0]) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={app.icon_url || app.screenshots?.[0]}
                      alt={app.title}
                      className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {app.title.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{app.title}</p>
                    {app.category_name && (
                      <p className="text-xs text-muted-foreground">{app.category_name}</p>
                    )}
                  </div>
                </button>
              ))}
              {/* View all */}
              <Link
                href={`/apps?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setShowDropdown(false)}
                className="block px-4 py-2.5 text-sm text-primary font-medium hover:bg-muted transition-colors border-t border-border"
              >
                Lihat semua hasil →
              </Link>
            </>
          )}

          {/* No results */}
          {!loading && !suggestions.length && query.trim() && (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Tidak ada hasil untuk "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  )
}