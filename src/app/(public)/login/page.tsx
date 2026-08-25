'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const callbackUrl = '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setFormError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setFormError('Terjadi kesalahan, coba lagi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-blue-600">Yukii</span>
              <span className="text-2xl font-bold text-gray-900">Chii</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Masuk ke Admin</h1>
            <p className="text-gray-500 mt-2">Masukkan email dan password untuk mengakses dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@yukiichii.com"
                required
                disabled={loading}
                autoComplete="email"
                className="w-full h-10 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
                className="w-full h-10 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button type="submit" disabled={loading} className="w-full h-12 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <>
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 014.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Kembali ke <a href="/" className="text-blue-600 hover:underline">Beranda</a>
          </p>
        </div>
      </div>
    </div>
  )
}

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  const email = formData.get('email')
  const password = formData.get('password')
}