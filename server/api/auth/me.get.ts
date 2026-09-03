import { getAuthenticatedUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getAuthenticatedUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No hay una sesión activa o el token ha expirado.'
    })
  }

  return {
    success: true,
    user: user.toJSON()
  }
})

