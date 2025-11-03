import { NextResponse } from 'next/server'

export function middleware() {
  const res = NextResponse.next()
  if (process.env.NODE_ENV === 'development') {
    res.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co; font-src 'self' data:; object-src 'none'; frame-ancestors 'none';"
    )
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
}


