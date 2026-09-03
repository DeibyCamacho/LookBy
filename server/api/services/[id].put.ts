import { Service } from '../../models/service'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updateData: any = {}
  if (body.name !== undefined) updateData.name = String(body.name).trim()
  if (body.description !== undefined) updateData.description = String(body.description).trim()
  if (body.price !== undefined) updateData.price = Number(body.price)
  if (body.duration !== undefined) updateData.duration = Number(body.duration)
  if (body.category !== undefined) updateData.category = String(body.category).trim()
  if (body.active !== undefined) updateData.active = Boolean(body.active)

  const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })

  if (!updatedService) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Servicio no encontrado.'
    })
  }

  return {
    success: true,
    message: 'Servicio actualizado exitosamente.',
    data: updatedService
  }
})
