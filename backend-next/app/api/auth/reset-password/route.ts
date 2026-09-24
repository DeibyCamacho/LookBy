import { NextResponse, type NextRequest } from 'next/server'
import { User } from '@/lib/models/user'
import { hashPassword } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  await connectDB()

  const body = await request.json().catch(() => ({}))
  const token = String(body?.token || '').trim()
  const newPassword = String(body?.newPassword || '')

  if (!token) {
    return NextResponse.json({
      success: false,
      message: 'El token de recuperación es obligatorio.'
    }, { status: 400 })
  }

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({
      success: false,
      message: 'La nueva contraseña debe tener al menos 6 caracteres.'
    }, { status: 400 })
  }

  // Buscar usuario con token válido que no haya expirado
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  })

  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.'
    }, { status: 400 })
  }

  // Hashear y actualizar contraseña
  user.contrasena = await hashPassword(newPassword)
  user.resetPasswordToken = null as any
  user.resetPasswordExpires = null as any
  await user.save()

  return NextResponse.json({
    success: true,
    message: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.'
  })
}