import { NextResponse } from 'next/server'

const RAW_URL =
  'https://raw.githubusercontent.com/biolooole-cmyk/biogame/claude/quirky-allen-fteyku/public/bioscan.html'

let cached: string | null = null

export async function GET() {
  if (!cached) {
    const res = await fetch(RAW_URL, { next: { revalidate: 3600 } })
    if (!res.ok) {
      return new NextResponse('Failed to load game', { status: 502 })
    }
    cached = await res.text()
  }
  return new NextResponse(cached, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
