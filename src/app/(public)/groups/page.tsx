import { Metadata } from 'next'
import Link from 'next/link'
import { getAppGroups } from '@/lib/db/queries'
import { unstable_noStore } from 'next/cache'

export const metadata: Metadata = {
  title: 'Group Aplikasi',
  description: 'Kelompok aplikasi terkumpul rapi di YukiiChii.',
}

export const dynamic = 'force-dynamic'

export default async function GroupsPage() {
  unstable_noStore()

  let groups: any[] = []
  let dbError: Error | null = null

  try {
    groups = await getAppGroups()
  } catch (error) {
    console.error('Database error:', error)
    dbError = error as Error
    groups = []
  }

  return (
    <div className="min-h-screen">
      <div className="bg-muted/30 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Group Aplikasi</h1>
          <p className="text-muted-foreground mt-2">Kelompok aplikasi terkumpul rapi untuk memudahkan pencarian</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {dbError && (
          <div className="bg-yellow-50 border-y border-yellow-200 px-4 py-3 text-center mb-8">
            <div className="flex items-center justify-center gap-2 text-yellow-700 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Database sedang bermasalah, menampilkan tampilan default.</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/groups/${group.slug}`}
              className="group flex flex-col items-center p-6 rounded-2xl border border-border bg-background hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <div className="relative w-32 h-32 rounded-xl overflow-hidden mb-4 bg-muted transition-transform group-hover:scale-105">
                {group.logo_url ? (
                  <img
                    src={group.logo_url}
                    alt={group.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
                    <span className="text-4xl font-bold text-primary/60">{group.title.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors text-center mb-1">{group.title}</h3>
              {group.description && (
                <p className="text-sm text-muted-foreground text-center mb-2 line-clamp-2">{group.description}</p>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Lihat aplikasi
              </span>
            </Link>
          ))}

          {groups.length === 0 && (
            <div className="col-span-full text-center py-16">
              <span className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 inline-block" />
              <h2 className="text-xl font-semibold text-foreground">Belum ada group aplikasi</h2>
              <p className="text-muted-foreground mt-2">Group akan muncul setelah admin menambahkannya</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}