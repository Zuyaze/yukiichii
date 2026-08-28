export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { getAllAppGroups } from '@/lib/db/queries'
import { AppGroupsClient } from './AppGroupsClient'

export const metadata: Metadata = {
  title: 'Kelola Group Aplikasi',
}

export default async function AppGroupsPage() {
  const groups = await getAllAppGroups()

  return <AppGroupsClient initialGroups={groups} />
}