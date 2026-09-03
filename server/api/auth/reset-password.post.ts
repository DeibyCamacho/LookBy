import { User } from '../../models/user'
import { hashPassword } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = String(body?.token || '').trim()
  const newPassword = String(body?.newPassword || '')

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El token de recuperación es obligatorio.'
    })
  }

  if (!newPassword || newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La nueva contraseña debe tener al menos 6 caracteres.'
    })
  }

  // Buscar usuario con token válido que no haya expirado
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() }
  })

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.'
    })
  }

  // Hashear y actualizar contraseña
  user.password = await hashPassword(newPassword)
  user.resetPasswordToken = null
  user.resetPasswordExpires = null
  await user.save()

  return {
    success: true,
    message: 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.'
  }
})
