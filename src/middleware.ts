import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory rate limiter for auth endpoints
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_ATTEMPTS = 10

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  entry.count++
  // Cleanup old entries occasionally
  if (attempts.size > 500) {
    for (const [key, val] of attempts) {
      if (now > val.resetAt) attempts.delete(key)
    }
  }
  return entry.count > MAX_ATTEMPTS
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limit login attempts (brute-force protection)
  if (pathname.startsWith('/api/auth/callback') && request.method === 'POST') {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.' },
        { status: 429 }
      )
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/dashboard')) {
    const hasSessionCookie =
      request.cookies.has('authjs.session-token') ||
      request.cookies.has('__Secure-authjs.session-token')

    if (!hasSessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Redirect authenticated users away from login
  if (pathname === '/login') {
    const hasSessionCookie =
      request.cookies.has('authjs.session-token') ||
      request.cookies.has('__Secure-authjs.session-token')
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/api/auth/callback/:path*'],
}