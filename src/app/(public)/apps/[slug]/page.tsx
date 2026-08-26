import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAppBySlug, recordClick } from '@/lib/db/queries'
import { Badge } from '@/components/ui/badge'
import { Download, ArrowLeft, Calendar, ShieldCheck, Zap } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ScreenshotGallery } from '@/components/screenshot-gallery'

interface AppDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const app = await getAppBySlug(slug)

  if (!app) return { title: 'Aplikasi Tidak Ditemukan' }

  return {
    title: app.title,
    description: app.description || `Download ${app.title} gratis di YukiiChii`,
  }
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params
  const app = await getAppBySlug(slug)

  if (!app) notFound()

  await recordClick(app.id, null, null)

  const screenshots = (app as any).screenshots || []
  const iconUrl = (app as any).icon_url || null

  return (
    <div className="min-h-screen bg-background">
      {/* Back link */}
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
          <Link
            href="/apps"
            className="inline-flex items-center gap-1.5 px-3 py-2 -ml-3 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6">
        {/* ===== Header card ===== */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={iconUrl}
                alt={app.title}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-1 ring-border flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20">
                <span className="text-3xl font-bold text-primary">{app.title.charAt(0)}</span>
              </div>
            )}

            <div className="min-w-0">
              {(app as any).category_name && (
                <Link href={`/apps?category=${(app as any).category_slug}`} className="inline-block mb-1.5">
                  <Badge
                    variant="secondary"
                    className="text-xs font-medium"
                    style={{
                      backgroundColor: `${(app as any).category_color}20`,
                      color: (app as any).category_color,
                      borderColor: `${(app as any).category_color}40`,
                    }}
                  >
                    {(app as any).category_name}
                  </Badge>
                </Link>
              )}
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight break-words">
                {app.title}
              </h1>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                Update {formatDate(app.updated_at)}
              </div>
            </div>
          </div>

          {/* Feature pills */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-green-500/10 py-2 text-xs font-semibold text-green-600 dark:text-green-400">
              <ShieldCheck className="w-4 h-4" />
              100% Gratis
            </div>
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-500/10 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Zap className="w-4 h-4" />
              Full Mod
            </div>
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-purple-500/10 py-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-4 h-4" />
              Aman
            </div>
          </div>
        </div>

        {/* ===== Screenshots ===== */}
        {screenshots.length > 0 && (
          <section className="mt-6">
            <ScreenshotGallery screenshots={screenshots} title={app.title} />
          </section>
        )}

        {/* ===== Single Download Box ===== */}
        <section className="mt-6 rounded-2xl border border-green-500/30 bg-gradient-to-b from-green-500/10 to-transparent p-5 sm:p-6">
          <a href={app.download_url} target="_blank" rel="noopener noreferrer" className="block group/dl">
            <button className="relative w-full min-h-[72px] py-4 bg-gradient-to-b from-green-500 to-emerald-600 text-white rounded-2xl shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all cursor-pointer border-0 overflow-hidden">
              {/* shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover/dl:translate-x-full transition-transform duration-700" />
              <span className="relative flex items-center justify-center gap-3">
                <Download className="w-7 h-7" />
                <span className="text-xl sm:text-2xl font-extrabold tracking-wide">DOWNLOAD</span>
              </span>
              <span className="relative block text-xs font-medium text-green-100 mt-0.5">
                {app.title}
              </span>
            </button>
          </a>
          <div className="grid grid-cols-3 gap-2 mt-4 text-center text-[11px] sm:text-xs text-muted-foreground">
            <span>✓ Gratis</span>
            <span>✓ Tanpa Virus</span>
            <span>✓ Link Aktif</span>
          </div>
        </section>

        {/* ===== Deskripsi ===== */}
        {app.description && (
          <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold text-foreground mb-3">Tentang Mod Ini</h2>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {app.description}
            </p>
          </section>
        )}

        {/* ===== Informasi ===== */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Informasi</h2>
          <dl className="divide-y divide-border">
            {(app as any).category_name && (
              <div className="flex justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground">Kategori</dt>
                <dd className="font-medium text-foreground">{(app as any).category_name}</dd>
              </div>
            )}
            <div className="flex justify-between py-2.5 text-sm">
              <dt className="text-muted-foreground">Update</dt>
              <dd className="font-medium text-foreground">{formatDate(app.updated_at)}</dd>
            </div>
            <div className="flex justify-between py-2.5 text-sm">
              <dt className="text-muted-foreground">Harga</dt>
              <dd className="font-medium text-green-600 dark:text-green-400">Gratis</dd>
            </div>
            {app.tags?.length > 0 && (
              <div className="flex justify-between items-start py-2.5 text-sm gap-4">
                <dt className="text-muted-foreground flex-shrink-0">Tag</dt>
                <dd className="flex flex-wrap gap-1 justify-end">
                  {app.tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="text-xs"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>
      </div>
    </div>
  )
}

