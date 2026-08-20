import crypto from 'node:crypto'
import { Resend } from 'resend'
import { User } from '../../models/user'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Debes ingresar un correo electrónico válido.'
    })
  }

  const user = await User.findOne({ email })

  // Por seguridad, si el usuario no existe, devolvemos respuesta genérica exitosa
  if (!user) {
    return {
      success: true,
      message: 'Si el correo está registrado en el sistema, recibirás un enlace de recuperación.'
    }
  }

  // Generar token criptográfico y expiración de 1 hora
  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetExpires = new Date(Date.now() + 60 * 60 * 1000)

  user.resetPasswordToken = resetToken
  user.resetPasswordExpires = resetExpires
  await user.save()

  const config = useRuntimeConfig()
  const resetUrl = `/admin/reset-password?token=${resetToken}`

  // Si está configurada la API key de Resend, enviamos el correo real
  if (config.resendApiKey && config.resendApiKey !== 're_1234567890') {
    try {
      const resend = new Resend(config.resendApiKey)
      await resend.emails.send({
        from: 'LookBy <onboarding@resend.dev>',
        to: user.email,
        subject: 'Recuperación de contraseña - LookBy',
        html: `
          <h2>Hola, ${user.name}</h2>
          <p>Has solicitado restablecer tu contraseña en LookBy.</p>
          <p>Haz clic en el siguiente enlace para continuar:</p>
          <p><a href="${resetUrl}" style="background:#C89D7C; color:#fff; padding:10px 20px; text-decoration:none; border-radius:8px;">Restablecer Contraseña</a></p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no realizaste esta solicitud, puedes ignorar este mensaje.</p>
        `
      })
    } catch (emailError) {
      console.error('[LookBy] Error al enviar correo de recuperación con Resend:', emailError)
    }
  } else {
    console.log(`[LookBy DEV] Token de recuperación generado para ${email}: ${resetToken}`)
    console.log(`[LookBy DEV] Enlace de restablecimiento: ${resetUrl}`)
  }

  return {
    success: true,
    message: 'Si el correo está registrado en el sistema, recibirás un enlace de recuperación.',
    // En entorno de desarrollo incluimos el enlace directo para pruebas
    devResetUrl: process.env.NODE_ENV !== 'production' ? resetUrl : undefined
  }
})
