'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackCTAProps {
  telegramUrl?: string
  title?: string
  iconUrl?: string
}

export function FeedbackCTA({ telegramUrl = 'https://t.me/+a3KcPUIk3UxlZjk1', title = 'No Feedback No Update Mods', iconUrl }: FeedbackCTAProps) {
  const [cta, setCta] = useState<{ title: string; link_url: string; icon_url: string | null } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCTA() {
      try {
        const res = await fetch('/api/feedback-cta', { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          if (data.ctas && data.ctas.length > 0) {
            const activeCTA = data.ctas.find((c: any) => c.is_active)
            if (activeCTA) {
              setCta({
                title: activeCTA.title,
                link_url: activeCTA.link_url,
                icon_url: activeCTA.icon_url,
              })
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch feedback CTA:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCTA()
  }, [])

  if (loading || !cta) return null

  return (
    <section className="mt-6 rounded-2xl bg-[#0088cc]/10 border border-[#0088cc]/20 p-4 sm:p-5">
      <Link
        href={cta.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center justify-center gap-3 rounded-xl bg-[#0088cc] text-white px-4 py-3 sm:px-5 sm:py-4',
          'shadow-lg shadow-[#0088cc]/30 hover:shadow-xl hover:shadow-[#0088cc]/40',
          'hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200',
          'group'
        )}
        onClick={() => {}}
      >
        <span className="flex items-center gap-2 text-base sm:text-lg font-semibold leading-tight">
          {cta.title}
        </span>
        <span className="flex-shrink-0">
          {cta.icon_url ? (
            <img
              src={cta.icon_url}
              alt="Telegram"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded"
            />
          ) : (
            <Send className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
          )}
        </span>
      </Link>
    </section>
  )
}