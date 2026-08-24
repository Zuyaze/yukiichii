// import { auth } from '@/lib/auth'
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// export async function middleware(request: NextRequest) {
//   const session = await auth()
//   const { pathname } = request.nextUrl

//   // Protect admin routes
//   if (pathname.startsWith('/dashboard')) {
//     if (!session?.user) {
//       const loginUrl = new URL('/login', request.url)
//       loginUrl.searchParams.set('callbackUrl', pathname)
//       return NextResponse.redirect(loginUrl)
//     }
//   }

//   // Redirect authenticated users away from login
//   if (pathname === '/login' && session?.user) {
//     return NextResponse.redirect(new URL('/dashboard', request.url))
//   }

//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/dashboard/:path*', '/login'],
// }