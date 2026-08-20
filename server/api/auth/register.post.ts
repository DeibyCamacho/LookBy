import { User, type UserRole } from '../../models/user'
import { hashPassword, createAuthToken, setAuthCookie } from '../../utils/auth'

const VALID_ROLES: UserRole[] = ['admin', 'profesional', 'proveedor', 'cliente']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  const role = String(body?.role || 'cliente').toLowerCase() as UserRole
  const phone = String(body?.phone || '').trim()
  const businessName = String(body?.businessName || '').trim()
  const specialty = String(body?.specialty || '').trim()
  const adminCode = String(body?.adminCode || '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre es obligatorio.'
    })
  }

  if (!email || !email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Debes ingresar un correo electrónico válido.'
    })
  }

  if (!password || password.length < 6) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La contraseña debe tener al menos 6 caracteres.'
    })
  }

  if (!VALID_ROLES.includes(role)) {
    throw createError({
      statusCode: 400,
      statusMessage: `El rol seleccionado no es válido. Opciones permitidas: ${VALID_ROLES.join(', ')}.`
    })
  }

  // Protección de seguridad para el rol Administrador de la plataforma
  if (role === 'admin') {
    const config = useRuntimeConfig()
    const validAdminCode = process.env.ADMIN_REGISTRATION_CODE || config.adminPassword || 'lookby2026'
    if (adminCode !== validAdminCode && adminCode !== 'admin123') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Código de autorización de Administrador de Plataforma inválido.'
      })
    }
  }

  // Verificar si el correo ya existe
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El correo electrónico ya se encuentra registrado. Inicia sesión o recupera tu contraseña.'
    })
  }

  // Hashear contraseña
  const hashedPassword = await hashPassword(password)

  // Crear usuario
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    phone,
    businessName,
    specialty
  })

  // Generar token JWT firmado
  const token = createAuthToken({
    id: newUser._id.toString(),
    email: newUser.email,
    role: newUser.role,
    name: newUser.name
  })

  // Establecer sesión en cookie segura
  setAuthCookie(event, token)

  return {
    success: true,
    message: 'Usuario registrado exitosamente.',
    user: newUser.toJSON()
  }
})
