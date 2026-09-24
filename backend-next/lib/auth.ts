import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { NextRequest } from 'next/server'
import { User, type IUser } from './models/user'

export interface TokenPayload {
  id: string
  email: string
  role: string
  name: string
}

export const AUTH_COOKIE_NAME = 'lookby_auth_token'

const JWT_SECRET = process.env.JWT_SECRET || 'lookby-dev-secret-key-change-in-prod'

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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

/**
 * Opciones estándar de la cookie de sesión (httpOnly, 7 días)
 */
export const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: 60 * 60 * 24 * 7
}

/**
 * Obtiene el token de la cookie de la petición
 */
export function getAuthToken(req: NextRequest): string | null {
  return req.cookies.get(AUTH_COOKIE_NAME)?.value ?? null
}

/**
 * Obtiene el usuario autenticado a partir de la cookie de sesión
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<IUser | null> {
  const token = getAuthToken(req)
  if (!token) return null

  const payload = verifyAuthToken(token)
  if (!payload || !payload.id) return null

  try {
    return await User.findById(payload.id)
  } catch {
    return null
  }
}
