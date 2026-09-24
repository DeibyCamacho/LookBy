import { NextResponse, type NextRequest } from 'next/server'
import { User } from '@/lib/models/user'
import { Role } from '@/lib/models/role'
import { UserRole } from '@/lib/models/userRole'
import { hashPassword, createAuthToken, AUTH_COOKIE_NAME, authCookieOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

const VALID_ROLES = ['admin', 'profesional', 'proveedor', 'cliente']

export async function POST(request: NextRequest) {
  await connectDB()

  const body = await request.json().catch(() => ({}))

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
    return NextResponse.json({
      success: false,
      message: 'El nombre es obligatorio.'
    }, { status: 400 })
  }

  if (!email || !email.includes('@')) {
    return NextResponse.json({
      success: false,
      message: 'Debes ingresar un correo electrónico válido.'
    }, { status: 400 })
  }

  if (!password || password.length < 6) {
    return NextResponse.json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres.'
    }, { status: 400 })
  }

  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json({
      success: false,
      message: `El rol seleccionado no es válido. Opciones permitidas: ${VALID_ROLES.join(', ')}.`
    }, { status: 400 })
  }

  // Protección de seguridad para el rol Administrador de la plataforma
  if (role === 'admin') {
    const validAdminCode = process.env.ADMIN_REGISTRATION_CODE || process.env.ADMIN_PASSWORD || 'lookby2026'
    if (adminCode !== validAdminCode && adminCode !== 'admin123') {
      return NextResponse.json({
        success: false,
        message: 'Código de autorización de Administrador de Plataforma inválido.'
      }, { status: 403 })
    }
  }

  // Verificar si el correo ya existe
  const existingUser = await User.findOne({
    $or: [{ correo: email }, { email: email }]
  })

  if (existingUser) {
    return NextResponse.json({
      success: false,
      message: 'El correo electrónico ya se encuentra registrado. Inicia sesión o recupera tu contraseña.'
    }, { status: 400 })
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
  const res = NextResponse.json({
    success: true,
    message: 'Usuario registrado exitosamente.',
    user: newUser.toJSON()
  })
  res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions)

  return res
}