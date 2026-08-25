import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = getDb()
    const result = await db.execute({ sql: 'SELECT 1 as test' })
    return Response.json({
      success: true,
      data: result.rows,
      env: {
        hasUrl: !!process.env.DATABASE_URL,
        urlPrefix: process.env.DATABASE_URL?.substring(0, 30),
      },
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        env: {
          hasUrl: !!process.env.DATABASE_URL,
          urlPrefix: process.env.DATABASE_URL?.substring(0, 30),
        },
      },
      { status: 500 }
    )
  }
}