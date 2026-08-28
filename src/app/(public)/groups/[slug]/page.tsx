import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAppGroupWithApps, getAppGroupBySlug } from '@/lib/db/queries'
import { unstable_noStore } from 'next/cache'

interface GroupPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  const { slug } = await params
  const group = await getAppGroupBySlug(slug)

  if (!group) return { title: 'Group Tidak Ditemukan' }

  return {
    title: group.title,
    description: group.description || `Group ${group.title} di YukiiChii.`,
  }
}

export default async function GroupPage({ params }: GroupPageProps) {
  unstable_noStore()

  const { slug } = await params
  const group = await getAppGroupBySlug(slug)

  if (!group) notFound()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/groups"
            className="inline-flex items-center gap-1.5 px-3 py-2 -ml-3 text-sm font-medium text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Group
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted border border-border">
              {group.logo_url ? (
                <img src={group.logo_url} alt={group.title} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                  <span className="text-4xl font-bold text-primary/60">{group.title.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{group.title}</h1>
              {group.description && <p className="text-muted-foreground mt-2">{group.description}</p>}
              <p className="text-sm text-muted-foreground mt-2">{group.apps.length} aplikasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {group.apps.map(app => (
            <Link
              key={app.id}
              href={`/apps/${app.slug}`}
              className="group block flex-shrink-0"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all">
                {(app.icon_url || app.screenshots?.[0]) ? (
                  <img
                    src={app.icon_url || app.screenshots?.[0]}
                    alt={app.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/15 to-primary/5">
                    <span className="text-2xl font-bold text-primary/60">{app.title.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                {app.category_name && (
                  <span
                    className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-bold rounded-md"
                    style={{ backgroundColor: `${app.category_color || '#3b82f6'}E6`, color: '#fff' }}
                  >
                    {app.category_name}
                  </span>
                )}
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[8px] font-black rounded bg-green-500 text-white">GRATIS</span>
              </div>
              <p className="mt-1.5 text-xs font-medium text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                {app.title}
              </p>
            </Link>
          ))}

          {group.apps.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Belum ada aplikasi di group ini</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}