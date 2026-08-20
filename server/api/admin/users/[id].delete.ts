import { User } from '../../../models/user'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)

  if (currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Solo administradores pueden eliminar usuarios.'
    })
  }

  const id = getRouterParam(event, 'id')

  // No permitir que el admin se elimine a sí mismo
  if (id === currentUser._id.toString()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No puedes eliminar tu propia cuenta de administrador.'
    })
  }

  const deletedUser = await User.findByIdAndDelete(id)

  if (!deletedUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuario no encontrado.'
    })
  }

  return {
    success: true,
    message: 'Usuario eliminado del sistema.'
  }
})
