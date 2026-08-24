import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getAppBySlug, recordClick } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, ArrowLeft, Calendar, Tag, FolderOpen, ExternalLink, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'
import { unstable_noStore } from 'next/cache'

interface AppDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  unstable_noStore()
  const app = await getAppBySlug(slug)
  
  if (!app) return { title: 'Aplikasi Tidak Ditemukan' }
  
  return {
    title: app.title,
    description: app.description || `Download ${app.title} gratis di YukiiChii`,
    openGraph: {
      title: app.title,
      description: app.description || `Download ${app.title} gratis di YukiiChii`,
      type: 'website',
      images: (app as any).screenshots?.[0] ? [(app as any).screenshots[0]] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: app.title,
      description: app.description || `Download ${app.title} gratis di YukiiChii`,
      images: (app as any).screenshots?.[0] ? [(app as any).screenshots[0]] : [],
    },
  }
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  unstable_noStore()
  const { slug } = await params
  const app = await getAppBySlug(slug)

  if (!app) notFound()

  await recordClick(app.id, null, null)

  const screenshots = (app as any).screenshots || []

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/apps" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Aplikasi
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              {app.category_name && (
                <Badge variant="secondary" className="mb-2 text-sm" style={{ backgroundColor: `${app.category_color}20`, color: app.category_color, borderColor: `${app.category_color}40` }}>
                  {app.category_name}
                </Badge>
              )}
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{app.title}</h1>
            </div>
            <a
              href={app.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-full sm:w-auto"
            >
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-5 h-5" />
                DOWNLOAD
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {screenshots.length > 0 && (
              <section className="space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                  {screenshots.length === 1 ? (
                    <Image
                      src={screenshots[0]}
                      alt={app.title}
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  ) : (
                    <ScreenshotCarousel screenshots={screenshots} title={app.title} />
                  )}
                </div>
                {screenshots.length > 1 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {screenshots.map((url: string, index: number) => (
                      <button
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden border-2 transition-colors"
                        style={{ borderColor: index === 0 ? 'var(--primary)' : 'transparent' }}
                      >
                        <Image
                          src={url}
                          alt={`${app.title} screenshot ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="100px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {app.description && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4">Deskripsi</h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{app.description}</p>
                </div>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Informasi</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Diperbarui</dt>
                    <dd className="font-medium">{formatDate(app.updated_at)}</dd>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Ditambahkan</dt>
                    <dd className="font-medium">{formatDate(app.created_at)}</dd>
                  </div>
                </div>
                {app.category_name && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                    <FolderOpen className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <dt className="text-sm text-muted-foreground">Kategori</dt>
                      <dd className="font-medium">{app.category_name}</dd>
                    </div>
                  </div>
                )}
                {app.tags.length > 0 && (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                    <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <dt className="text-sm text-muted-foreground">Tag</dt>
                      <dd className="flex flex-wrap gap-1 mt-1">
                        {app.tags.map(tag => (
                          <Badge key={tag.id} variant="secondary" className="text-xs" style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}>
                            {tag.name}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-border bg-background p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Download</h3>
                <p className="text-sm text-muted-foreground">Klik tombol di bawah untuk mengunduh aplikasi</p>
                <a
                  href={app.download_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg" size="lg">
                    <Download className="w-5 h-5 mr-2" />
                    DOWNLOAD
                  </Button>
                </a>
                <p className="text-xs text-muted-foreground text-center">Akan dibuka di tab baru</p>
              </div>

              <div className="rounded-xl border border-border bg-background p-6 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Bagikan</h3>
                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground border border-border rounded-lg transition-colors"
                    onClick={() => navigator.share?.({ title: app.title, url: window.location.href })}
                  >
                    <Share2 className="w-4 h-4" />
                    Bagikan
                  </button>
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground border border-border rounded-lg transition-colors"
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Salin Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenshotCarousel({ screenshots, title }: { screenshots: string[]; title: string }) {
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-300" style={{ width: `${screenshots.length * 100}%` }}>
          {screenshots.map((url, index) => (
            <div key={index} className="w-full flex-shrink-0" style={{ width: `${100 / screenshots.length}%` }}>
              <Image
                src={url}
                alt={`${title} screenshot ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>
          ))}
        </div>
      </div>
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}