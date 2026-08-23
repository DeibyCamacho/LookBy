import { User } from '../../models/user'
import { verifyPassword, createAuthToken, setAuthCookie, ensureDefaultAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Debes ingresar correo electrónico y contraseña.'
    })
  }

  // Asegurar que exista el administrador por defecto si la base de datos está vacía
  await ensureDefaultAdmin()

  // Buscar usuario en la base de datos
  const user = await User.findOne({ email })
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas. Verifica tu correo y contraseña.'
    })
  }

  // Validar contraseña con bcrypt
  const isMatch = await verifyPassword(password, user.password)
  if (!isMatch) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas. Verifica tu correo y contraseña.'
    })
  }

  // Generar JWT firmado
  const token = createAuthToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name
  })

  // Establecer cookie segura httpOnly
  setAuthCookie(event, token)

  return {
    success: true,
    message: 'Inicio de sesión exitoso.',
    user: user.toJSON()
  }
})

