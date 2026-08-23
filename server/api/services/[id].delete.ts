import { Service } from '../../models/service'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const deletedService = await Service.findByIdAndDelete(id)

  if (!deletedService) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Servicio no encontrado.'
    })
  }

  return {
    success: true,
    message: 'Servicio eliminado correctamente.'
  }
})
