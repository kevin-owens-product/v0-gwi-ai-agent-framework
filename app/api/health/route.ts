import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'unknown',
    version: process.env.npm_package_version || '1.0.0',
  }

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    healthCheck.database = 'connected'

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    healthCheck.status = 'unhealthy'
    healthCheck.database = 'disconnected'

    return NextResponse.json(
      {
        ...healthCheck,
        error: error instanceof Error ? error.message : 'Unknown database error',
      },
      { status: 503 }
    )
  }
}
