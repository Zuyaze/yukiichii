'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  const navLinks = (
    <>
      <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Beranda</Link>
      <Link href="/apps" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Aplikasi</Link>
      <Link href="/categories" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Kategori</Link>
      <Link href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Admin</Link>
    </>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full h-16 border-b border-border bg-background">
        <nav className="h-full mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-2" aria-label="YukiiChii Home">
            <span className="text-xl font-bold text-primary">Yukii</span>
            <span className="text-xl font-bold text-foreground">Chii</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6">{navLinks}</div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
            >
              {mounted ? (
                isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              ) : (
                <Moon className="h-5 w-5 opacity-0" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background shadow-lg py-4 px-4 space-y-2 flex flex-col">
            {navLinks}
          </div>
        )}
      </header>

      <main className="flex-1 w-full">{children}</main>

      <footer className="border-t border-border bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">Yukii</span>
              <span className="text-lg font-bold text-foreground">Chii</span>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              &copy; {new Date().getFullYear()} YukiiChii. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}