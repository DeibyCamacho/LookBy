import type { H3Event } from 'h3'
import { getAuthenticatedUser } from './auth'
import type { IUser } from '../models/user'

/**
 * Guard de autenticación para endpoints que requieren sesión activa
 */
export async function requireAuth(event: H3Event): Promise<IUser> {
  const user = await getAuthenticatedUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No estás autorizado para realizar esta acción. Inicia sesión.'
    })
  }

  return user
}
