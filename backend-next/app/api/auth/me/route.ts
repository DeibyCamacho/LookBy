import { NextResponse, type NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  await connectDB()

  const user = await getAuthenticatedUser(request)

  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'No hay una sesión activa o el token ha expirado.'
    }, { status: 401 })
  }

  return NextResponse.json({
    success: true,
    user: user.toJSON()
  })
}