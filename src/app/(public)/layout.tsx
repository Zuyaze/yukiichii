'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import { Menu, X, Sun, Moon, Home, LayoutGrid, FolderOpen, LogIn } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const isDark = mounted && resolvedTheme === 'dark'

  const menuItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/apps', label: 'Aplikasi', icon: LayoutGrid },
    { href: '/categories', label: 'Kategori', icon: FolderOpen },
    { href: '/login', label: 'Admin', icon: LogIn },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="w-full h-16 border-b border-border bg-background">
        <nav className="h-full mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <Link href="/" className="flex items-center gap-2" aria-label="YukiiChii Home">
            <span className="text-xl font-bold text-primary">Yukii</span>
            <span className="text-xl font-bold text-foreground">Chii</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex md:items-center md:gap-6">
            {menuItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute inset-x-0 top-full bg-background border-b border-border shadow-xl">
            <nav className="px-3 py-3 space-y-1">
              {menuItems.map(item => {
                const active =
                  item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-semibold transition-colors',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                    {active && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </Link>
                )
              })}

              {/* Theme toggle inside menu */}
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="flex w-full items-center gap-3.5 px-4 py-3.5 rounded-xl text-base font-semibold text-foreground/80 hover:bg-muted transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {isDark ? 'Mode Terang' : 'Mode Gelap'}
              </button>
            </nav>
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