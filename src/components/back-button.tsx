'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'

export function BackButton({ label = 'Kembali', fallback = '/' }: { label?: string; fallback?: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const handleBack = () => {
    // For top-level pages like /apps, always go to fallback (homepage)
    // For detail pages, use browser history if available
    if (pathname.startsWith('/apps/') || pathname.startsWith('/categories/') || pathname.startsWith('/groups/')) {
      // Detail pages - use browser history if available
      if (window.history.length > 1 && document.referrer.includes(window.location.origin)) {
        router.back()
      } else {
        router.push(fallback)
      }
    } else {
      // Top-level pages (/apps, /categories, /groups) - go to fallback
      router.push(fallback)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  )
}