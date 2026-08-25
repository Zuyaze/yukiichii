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
    default: 'YukiiChii - Kumpulan Aplikasi & Tools',
    template: '%s | YukiiChii',
  },
  description: 'Kumpulan aplikasi dan tools gratis untuk berbagai kebutuhan. Download mudah, cepat, dan aman.',
  keywords: ['aplikasi', 'tools', 'download', 'gratis', 'android', 'windows', 'software'],
  authors: [{ name: 'YukiiChii' }],
  creator: 'YukiiChii',
  publisher: 'YukiiChii',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://yukiichii.netlify.app',
    siteName: 'YukiiChii',
    title: 'YukiiChii - Kumpulan Aplikasi & Tools',
    description: 'Kumpulan aplikasi dan tools gratis untuk berbagai kebutuhan.',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'YukiiChii',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YukiiChii',
    description: 'Kumpulan aplikasi dan tools gratis.',
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
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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