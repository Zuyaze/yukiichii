import { v2 as cloudinary } from 'cloudinary'

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.CLOUDINARY_CLOUD_NAME

let configured = false

function configureCloudinary() {
  if (configured || isBuildTime) return
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  })
  configured = true
}

export async function uploadToCloudinary(
  file: File,
  folder = 'yukiichii'
): Promise<string> {
  configureCloudinary()
  
  const buffer = await file.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`
  
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    transformation: [
      { width: 1280, height: 720, crop: 'limit' },
      { fetch_format: 'auto', quality: 'auto' }
    ],
  })
  
  return result.secure_url
}

export async function uploadMultipleToCloudinary(
  files: File[],
  folder = 'yukiichii'
): Promise<string[]> {
  const uploads = files.map(file => uploadToCloudinary(file, folder))
  return Promise.all(uploads)
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Format tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.' }
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Ukuran file maksimal 5MB.' }
  }

  return { valid: true }
}

export function generateScreenshotKey(appSlug: string, index: number, ext: string): string {
  return `yukiichii/${appSlug}-${Date.now()}-${index}.${ext}`
}