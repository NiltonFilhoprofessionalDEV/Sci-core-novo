import { NextResponse } from 'next/server'
import { checkConnection } from '@/lib/supabase'

export async function GET() {
  try {
    const startTime = Date.now()
    const isConnected = await checkConnection()
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: isConnected,
        responseTime: `${responseTime}ms`
      },
      uptime: process.uptime()
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}





