import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAppBySlug, recordClick } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, ArrowLeft, Calendar, Tag, FolderOpen } from 'lucide-react'
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 py-6 sm:py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/apps"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Aplikasi
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              {(app as any).icon_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={(app as any).icon_url}
                  alt={app.title}
                  className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover ring-1 ring-border flex-shrink-0"
                />
              )}
              <div>
                {(app as any).category_name && (
                  <Link
                    href={`/apps?category=${(app as any).category_slug}`}
                    className="inline-block mb-2"
                  >
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${(app as any).category_color}20`,
                        color: (app as any).category_color,
                      }}
                    >
                      {(app as any).category_name}
                    </Badge>
                  </Link>
                )}
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{app.title}</h1>
              </div>
            </div>
            <a href={app.download_url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Download className="w-5 h-5" />
                DOWNLOAD
              </Button>
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: screenshots + description */}
          <div className="lg:col-span-2 space-y-8">
            {screenshots.length > 0 && (
              <section>
                <ScreenshotGallery screenshots={screenshots} title={app.title} />
              </section>
            )}

            {app.description && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-3">Deskripsi</h2>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {app.description}
                </p>
              </section>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Download</h3>
              <p className="text-sm text-muted-foreground">
                Gratis 100%. Klik tombol di bawah untuk mengunduh.
              </p>
              <a href={app.download_url} target="_blank" rel="noopener noreferrer" className="block">
                <Button className="w-full gap-2 py-3 text-base">
                  <Download className="w-5 h-5" />
                  DOWNLOAD
                </Button>
              </a>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-foreground">Informasi</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <dt className="text-muted-foreground">Diperbarui</dt>
                    <dd className="font-medium text-foreground">{formatDate(app.updated_at)}</dd>
                  </div>
                </div>
                {(app as any).category_name && (
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <dt className="text-muted-foreground">Kategori</dt>
                      <dd className="font-medium text-foreground">{(app as any).category_name}</dd>
                    </div>
                  </div>
                )}
                {app.tags?.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <dt className="text-muted-foreground">Tag</dt>
                      <dd className="flex flex-wrap gap-1 mt-1">
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
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}