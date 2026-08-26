'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function BackButton({ label = 'Kembali' }: { label?: string }) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  )
}