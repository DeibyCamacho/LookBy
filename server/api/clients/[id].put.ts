import { Client } from '../../models/client'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updateData: any = {}
  if (body.name !== undefined) updateData.name = String(body.name).trim()
  if (body.phone !== undefined) updateData.phone = String(body.phone).trim()
  if (body.email !== undefined) updateData.email = String(body.email).trim().toLowerCase()
  if (body.notes !== undefined) updateData.notes = String(body.notes).trim()
  if (body.totalVisits !== undefined) updateData.totalVisits = Number(body.totalVisits)

  const updatedClient = await Client.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })

  if (!updatedClient) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Cliente no encontrado.'
    })
  }

  return {
    success: true,
    message: 'Cliente actualizado exitosamente.',
    data: updatedClient
  }
})
