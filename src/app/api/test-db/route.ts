import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    const result = await db.execute('SELECT 1 as test')
    return NextResponse.json({ 
      success: true, 
      data: result.rows,
      env: {
        hasUrl: !!process.env.TURSO_DATABASE_URL,
        hasToken: !!process.env.TURSO_AUTH_TOKEN,
        urlPrefix: process.env.TURSO_DATABASE_URL?.substring(0, 30)
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error),
      env: {
        hasUrl: !!process.env.TURSO_DATABASE_URL,
        hasToken: !!process.env.TURSO_AUTH_TOKEN,
        urlPrefix: process.env.TURSO_DATABASE_URL?.substring(0, 30)
      }
    }, { status: 500 })
  }
}