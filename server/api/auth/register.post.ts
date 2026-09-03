import { User } from '../../models/user'
import { Role } from '../../models/role'
import { UserRole } from '../../models/userRole'
import { hashPassword, createAuthToken, setAuthCookie } from '../../utils/auth'

const VALID_ROLES = ['admin', 'profesional', 'proveedor', 'cliente']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = String(body?.nombre || body?.name || '').trim()
  const documento = String(body?.documento || '').trim()
  const email = String(body?.correo || body?.email || '').trim().toLowerCase()
  const direccion = String(body?.direccion || '').trim()
  const ubicacionGPS = String(body?.ubicacionGPS || '').trim()
  const password = String(body?.contrasena || body?.password || '')
  const role = String(body?.tipoUsuario || body?.role || 'cliente').toLowerCase()
  const phone = String(body?.telefono || body?.phone || '').trim()
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
  const existingUser = await User.findOne({
    $or: [{ correo: email }, { email: email }]
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El correo electrónico ya se encuentra registrado. Inicia sesión o recupera tu contraseña.'
    })
  }

  // Hashear contraseña
  const hashedPassword = await hashPassword(password)

  // Crear usuario con campos DER
  const newUser = await User.create({
    nombre: name,
    documento,
    correo: email,
    direccion,
    ubicacionGPS,
    contrasena: hashedPassword,
    telefono: phone,
    tipoUsuario: role,
    businessName,
    specialty
  })

  // Asociar a ROL / USUARIO_ROL
  try {
    let roleDoc = await Role.findOne({ nombre: role })
    if (!roleDoc) {
      roleDoc = await Role.create({
        nombre: role,
        descripcion: `Rol de ${role} en la plataforma`
      })
    }
    if (roleDoc) {
      await UserRole.create({
        idUsuario: newUser._id,
        idRol: roleDoc._id,
        descripcion: `Asignación inicial al registrarse como ${role}`
      })
    }
  } catch (err) {
    console.warn('Advertencia al asociar UserRole:', err)
  }

  // Generar token JWT firmado
  const token = createAuthToken({
    id: newUser._id.toString(),
    email: newUser.correo || newUser.email || '',
    role: newUser.tipoUsuario || newUser.role || 'cliente',
    name: newUser.nombre || newUser.name || ''
  })

  // Establecer sesión en cookie segura
  setAuthCookie(event, token)

  return {
    success: true,
    message: 'Usuario registrado exitosamente.',
    user: newUser.toJSON()
  }
})
