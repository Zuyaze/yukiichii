'use client'

import { useState } from 'react'
import { KeyRound, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (newPassword.length < 8) {
      setMessage({ type: 'err', text: 'Password baru minimal 8 karakter' })
      return
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'err', text: 'Konfirmasi password tidak cocok' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage({ type: 'err', text: data.error || 'Gagal mengganti password' })
      } else {
        setMessage({ type: 'ok', text: 'Password berhasil diganti!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch {
      setMessage({ type: 'err', text: 'Terjadi kesalahan' })
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full h-10 px-3 py-2 text-sm bg-background text-foreground border border-input rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          Ganti Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          {message && (
            <p
              className={
                message.type === 'ok'
                  ? 'text-sm text-green-600 dark:text-green-400 font-medium'
                  : 'text-sm text-destructive font-medium'
              }
            >
              {message.text}
            </p>
          )}
          <input
            type="password"
            placeholder="Password lama"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Password baru (min. 8 karakter)"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            minLength={8}
            disabled={loading}
            autoComplete="new-password"
            className={inputClass}
          />
          <input
            type="password"
            placeholder="Ulangi password baru"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="new-password"
            className={inputClass}
          />
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Ganti Password
          </button>
        </form>
      </CardContent>
    </Card>
  )
}