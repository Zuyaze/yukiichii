'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AppDetailBackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 px-3 py-2 -ml-3 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      Kembali
    </button>
  )
}