import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production' && !process.env.R2_ACCOUNT_ID

let r2: S3Client | null = null
let BUCKET = ''

if (!isBuildTime) {
  r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
  BUCKET = process.env.R2_BUCKET_NAME!
}

const getR2 = () => {
  if (!r2) {
    throw new Error('R2 not initialized. Please set R2 environment variables.')
  }
  return r2
}

const getBucket = () => {
  if (!BUCKET) {
    throw new Error('R2 bucket not configured')
  }
  return BUCKET
}

export async function getPresignedUploadUrl(key: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const client = getR2()
  const bucket = getBucket()
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 3600 })
  const publicUrl = `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`

  return { uploadUrl, publicUrl }
}

export async function uploadToR2(key: string, body: Buffer | ReadableStream, contentType: string): Promise<string> {
  const client = getR2()
  const bucket = getBucket()
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body as any,
    ContentType: contentType,
  })

  await client.send(command)
  return `https://${process.env.R2_PUBLIC_DOMAIN}/${key}`
}

export function generateScreenshotKey(appSlug: string, index: number, ext: string): string {
  return `apps/${appSlug}/screenshot-${index}.${ext}`
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