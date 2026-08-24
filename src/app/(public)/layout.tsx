'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Menu, X, Sun, Moon, Download, Grid } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

export function PublicLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-2" aria-label="YukiiChii Home">
            <span className="text-xl font-bold text-primary">Yukii</span>
            <span className="text-xl font-bold text-foreground">Chii</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-6">
            <Link href="/" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Beranda</Link>
            <Link href="/apps" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Aplikasi</Link>
            <Link href="/categories" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Kategori</Link>
            <a href="/login" className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">Admin</a>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 px-4 space-y-2">
            <Link href="/" className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Beranda</Link>
            <Link href="/apps" className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Aplikasi</Link>
            <Link href="/categories" className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Kategori</Link>
            <a href="/login" className="block px-3 py-2 text-base font-medium text-foreground/70 hover:text-foreground" onClick={() => setMobileMenuOpen(false)}>Admin</a>
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
            <div className="flex items-center gap-4">
              <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privasi</a>
              <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Syarat</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}