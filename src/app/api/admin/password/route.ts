import { getDb } from '@/lib/db'
import { auth } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return Response.json({ error: 'Password lama & baru wajib diisi' }, { status: 400 })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return Response.json({ error: 'Password baru minimal 8 karakter' }, { status: 400 })
    }

    const email = session.user?.email as string
    const db = getDb()

    const result = await db.execute({
      sql: 'SELECT * FROM admins WHERE email = ?',
      args: [email],
    })

    const admin = result.rows[0]
    if (!admin) {
      return Response.json({ error: 'Akun tidak ditemukan' }, { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, (admin as any).password_hash)
    if (!isValid) {
      return Response.json({ error: 'Password lama salah' }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 12)
    await db.execute({
      sql: 'UPDATE admins SET password_hash = ? WHERE id = ?',
      args: [newHash, admin.id],
    })

    return Response.json({ success: true, message: 'Password berhasil diganti' })
  } catch (error) {
    console.error('Change password error:', error)
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}