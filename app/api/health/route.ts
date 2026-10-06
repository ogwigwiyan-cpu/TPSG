import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    system: 'TPSG Application Foundation',
    timestamp: new Date().toISOString(),
  })
}
