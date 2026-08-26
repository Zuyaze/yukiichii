import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'YukiiChii × Zuyaze — Mod Apk & Loader Gratis',
    template: '%s | YukiiChii × Zuyaze',
  },
  description: 'Kumpulan Mod Apk & Loader gratis terbaru. Game dan aplikasi mod premium siap download — cepat, aman, tanpa ribet.',
  keywords: ['mod apk', 'apk mod', 'mod game', 'loader', 'download mod', 'premium unlock', 'mod android'],
  authors: [{ name: 'YukiiChii x Zuyaze' }],
  creator: 'YukiiChii x Zuyaze',
  publisher: 'YukiiChii x Zuyaze',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://yukiichii.netlify.app',
    siteName: 'YukiiChii × Zuyaze',
    title: 'YukiiChii × Zuyaze — Mod Apk & Loader Gratis',
    description: 'Kumpulan Mod Apk & Loader gratis terbaru.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'YukiiChii × Zuyaze',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YukiiChii × Zuyaze',
    description: 'Kumpulan Mod Apk & Loader gratis terbaru.',
    images: ['/og-image.svg'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e293b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}