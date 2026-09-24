import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME, authCookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const res = NextResponse.json({
    success: true,
    message: 'Sesión cerrada correctamente.'
  })
  res.cookies.set(AUTH_COOKIE_NAME, '', { ...authCookieOptions, maxAge: 0 })

  return res
}