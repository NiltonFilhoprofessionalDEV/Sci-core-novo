import { NextResponse } from 'next/server'

export function middleware() {
  const res = NextResponse.next()
  // Aplicar CSP tanto em desenvolvimento quanto em produção
  const isDev = process.env.NODE_ENV === 'development'
  const connectSrc = isDev 
    ? "'self' http://localhost:* ws://localhost:* https://*.supabase.co"
    : "'self' https://*.supabase.co"
  
  res.headers.set(
    'Content-Security-Policy',
    `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src ${connectSrc}; font-src 'self' data:; object-src 'none'; frame-ancestors 'none';`
  )
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg).*)'],
}


