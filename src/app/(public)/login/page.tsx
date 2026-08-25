'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const LoginForm = dynamic(() => import('./LoginForm').then(m => m.default), {
  ssr: false,
  loading: () => <div className="min-h-screen flex items-center justify-center">Memuat...</div>
})

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  )
}