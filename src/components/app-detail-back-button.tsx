'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export function AppDetailBackButton() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleBack = () => {
    // If there's history (not a direct navigation), go back
    if (window.history.length > 1 && document.referrer.includes(window.location.origin)) {
      router.back()
    } else {
      // Fallback: go to apps list with preserved search params if coming from apps page
      const referrer = document.referrer
      if (referrer && referrer.includes('/apps') && !referrer.includes('/apps/')) {
        router.back()
      } else {
        router.push('/apps')
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 px-3 py-2 -ml-3 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      Kembali
    </button>
  )
}