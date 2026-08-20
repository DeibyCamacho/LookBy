import { User } from '../../../models/user'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)

  if (currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Solo administradores pueden modificar usuarios.'
    })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updateData: any = {}
  if (body.role !== undefined) updateData.role = body.role
  if (body.name !== undefined) updateData.name = String(body.name).trim()
  if (body.phone !== undefined) updateData.phone = String(body.phone).trim()
  if (body.businessName !== undefined) updateData.businessName = String(body.businessName).trim()
  if (body.specialty !== undefined) updateData.specialty = String(body.specialty).trim()

  const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })

  if (!updatedUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuario no encontrado.'
    })
  }

  return {
    success: true,
    message: 'Usuario actualizado exitosamente.',
    data: updatedUser.toJSON()
  }
})
