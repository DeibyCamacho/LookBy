import { User } from '../../models/user'
import { verifyPassword, createAuthToken, setAuthCookie } from '../../utils/auth'
import { seedDatabase } from '../../utils/seeder'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || body?.correo || '').trim().toLowerCase()
  const password = String(body?.password || body?.contrasena || '')

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Debes ingresar correo electrónico y contraseña.'
    })
  }

  // Asegurar que la base de datos esté sembrada si está vacía
  await seedDatabase()

  // Buscar usuario en la base de datos
  const user = await User.findOne({
    $or: [{ correo: email }, { email: email }]
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas. Verifica tu correo y contraseña.'
    })
  }

  // Validar contraseña con bcrypt
  const passwordHash = user.contrasena || (user as any).password || ''
  const isMatch = await verifyPassword(password, passwordHash)
  if (!isMatch) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas. Verifica tu correo y contraseña.'
    })
  }

  // Generar JWT firmado
  const token = createAuthToken({
    id: user._id.toString(),
    email: user.correo || user.email || '',
    role: user.tipoUsuario || user.role || 'cliente',
    name: user.nombre || user.name || ''
  })

  // Establecer cookie segura httpOnly
  setAuthCookie(event, token)

  return {
    success: true,
    message: 'Inicio de sesión exitoso.',
    user: user.toJSON()
  }
})
