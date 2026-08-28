import { auth } from '@/lib/auth'
import { getGroupApps, getAppsNotInGroup, addAppToGroup, removeAppFromGroup } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const groupId = parseInt(id)
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const inGroup = searchParams.get('in_group') === 'true'

  if (isNaN(groupId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    let apps
    if (inGroup) {
      apps = await getGroupApps(groupId)
    } else {
      apps = await getAppsNotInGroup(groupId, search || undefined)
    }
    return Response.json({ apps })
  } catch (error) {
    console.error('Get group apps error:', error)
    return Response.json({ apps: [] })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const groupId = parseInt(id)

  if (isNaN(groupId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { app_ids } = body

    if (!app_ids || !Array.isArray(app_ids) || app_ids.length === 0) {
      return Response.json({ error: 'Pilih minimal 1 aplikasi' }, { status: 400 })
    }

    for (const appId of app_ids) {
      await addAppToGroup(groupId, appId)
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Add apps to group error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const groupId = parseInt(id)
  const { searchParams } = new URL(request.url)
  const appId = parseInt(searchParams.get('app_id') || '')

  if (isNaN(groupId) || isNaN(appId)) {
    return Response.json({ error: 'ID tidak valid' }, { status: 400 })
  }

  try {
    await removeAppFromGroup(groupId, appId)
    return Response.json({ success: true })
  } catch (error) {
    console.error('Remove app from group error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return Response.json({ error: msg }, { status: 500 })
  }
}