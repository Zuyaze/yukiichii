import { getPresignedUploadUrl, validateImageFile } from '@/lib/r2'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const key = formData.get('key') as string

    if (!file || !key) {
      return Response.json({ error: 'File dan key wajib diisi' }, { status: 400 })
    }

    const validation = validateImageFile(file)
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const { publicUrl } = await getPresignedUploadUrl(key, file.type)

    const uploadRes = await fetch(publicUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: buffer,
    })

    if (!uploadRes.ok) {
      return Response.json({ error: 'Gagal upload ke R2' }, { status: 500 })
    }

    return Response.json({ publicUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Terjadi kesalahan saat upload' }, { status: 500 })
  }
}