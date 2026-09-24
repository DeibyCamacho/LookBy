import { NextResponse, type NextRequest } from 'next/server'
import { User } from '@/lib/models/user'
import { verifyPassword, createAuthToken, AUTH_COOKIE_NAME, authCookieOptions } from '@/lib/auth'
import { seedDatabase } from '@/lib/seeder'
import { connectDB } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
  await connectDB()

  const body = await request.json().catch(() => ({}))
  const email = String(body?.email || body?.correo || '').trim().toLowerCase()
  const password = String(body?.password || body?.contrasena || '')

  if (!email || !password) {
    return NextResponse.json({
      success: false,
      message: 'Debes ingresar correo electrónico y contraseña.'
    }, { status: 400 })
  }

  // Asegurar que la base de datos esté sembrada si está vacía
  await seedDatabase()

  // Buscar usuario en la base de datos
  const user = await User.findOne({
    $or: [{ correo: email }, { email: email }]
  })

  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'Credenciales inválidas. Verifica tu correo y contraseña.'
    }, { status: 401 })
  }

  // Validar contraseña con bcrypt
  const passwordHash = user.contrasena || (user as any).password || ''
  const isMatch = await verifyPassword(password, passwordHash)
  if (!isMatch) {
    return NextResponse.json({
      success: false,
      message: 'Credenciales inválidas. Verifica tu correo y contraseña.'
    }, { status: 401 })
  }

  // Generar JWT firmado
  const token = createAuthToken({
    id: user._id.toString(),
    email: user.correo || user.email || '',
    role: user.tipoUsuario || user.role || 'cliente',
    name: user.nombre || user.name || ''
  })

  // Establecer cookie segura httpOnly
  const res = NextResponse.json({
    success: true,
    message: 'Inicio de sesión exitoso.',
    user: user.toJSON()
  })
  res.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions)

  return res
}