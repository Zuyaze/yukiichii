import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { ReactNode } from 'react'
import { AdminShell } from '@/components/admin-shell'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return <AdminShell email={session.user.email ?? 'Admin'}>{children}</AdminShell>
}