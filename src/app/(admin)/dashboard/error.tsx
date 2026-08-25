'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="max-w-lg mx-auto py-16 px-4 text-center">
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Terjadi kesalahan</h2>

        {/* Real error message for debugging */}
        <div className="mt-4 p-3 rounded-lg bg-muted text-left overflow-auto max-h-40">
          <p className="text-xs font-mono text-destructive break-all">
            {error.message || 'Unknown error'}
            {error.digest && (
              <span className="block text-muted-foreground mt-1">digest: {error.digest}</span>
            )}
          </p>
        </div>

        <div className="flex gap-3 justify-center mt-6">
          <Button onClick={reset} className="gap-2">
            <RotateCw className="w-4 h-4" />
            Coba Lagi
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Penuh
          </Button>
        </div>
      </div>
    </div>
  )
}