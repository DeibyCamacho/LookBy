import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import { User, type IUser } from '../models/user'

export interface TokenPayload {
  id: string
  email: string
  role: string
  name: string
}

const AUTH_COOKIE_NAME = 'lookby_auth_token'

/**
 * Hashea una contraseña en texto plano utilizando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Verifica si una contraseña coincide con un hash de bcrypt
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Genera un token JWT firmado
 */
export function createAuthToken(payload: TokenPayload): string {
  const config = useRuntimeConfig()
  const secret = config.jwtSecret || 'lookby-dev-secret-key'
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    const config = useRuntimeConfig()
    const secret = config.jwtSecret || 'lookby-dev-secret-key'
    return jwt.verify(token, secret) as TokenPayload
  } catch {
    return null
  }
}

/**
 * Guarda la cookie de sesión httpOnly segura
 */
export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 días
  })
}

/**
 * Elimina limpiamente la cookie de sesión en el navegador
 */
export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/'
  })
}

/**
 * Obtiene el token de la cookie
 */
export function getAuthToken(event: H3Event): string | null {
  return getCookie(event, AUTH_COOKIE_NAME) || null
}

/**
 * Obtiene el usuario autenticado a partir de la cookie de sesión
 */
export async function getAuthenticatedUser(event: H3Event): Promise<IUser | null> {
  const token = getAuthToken(event)
  if (!token) return null

  const payload = verifyAuthToken(token)
  if (!payload || !payload.id) return null

  try {
    const user = await User.findById(payload.id)
    return user
  } catch {
    return null
  }
}

/**
 * Crea el usuario Administrador inicial si no existe en la base de datos
 */
export async function seedAdminUser(): Promise<void> {
  const config = useRuntimeConfig()
  const adminEmail = process.env.ADMIN_EMAIL || config.adminEmail || 'admin@lookby.com'
  const adminPassword = process.env.ADMIN_PASSWORD || config.adminPassword || 'admin123'
  const adminName = process.env.ADMIN_NAME || 'Administrador LookBy'

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword)
    await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      phone: '3000000000',
      businessName: 'LookBy Platform',
      specialty: 'Administración'
    })
    console.log(`✓ Usuario Administrador creado automáticamente: ${adminEmail}`)
  }
}

export const ensureDefaultAdmin = seedAdminUser
