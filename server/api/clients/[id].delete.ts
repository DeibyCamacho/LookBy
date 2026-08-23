import { Client } from '../../models/client'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const deletedClient = await Client.findByIdAndDelete(id)

  if (!deletedClient) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Cliente no encontrado.'
    })
  }

  return {
    success: true,
    message: 'Cliente eliminado correctamente.'
  }
})
