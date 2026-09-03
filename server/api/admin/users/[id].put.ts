import { User } from '../../../models/user'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)

  if (currentUser.tipoUsuario !== 'admin' && currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Solo administradores pueden modificar usuarios.'
    })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const nombre = String(body?.nombre || body?.name || '').trim()
  const documento = String(body?.documento || '').trim()
  const correo = String(body?.correo || body?.email || '').trim().toLowerCase()
  const telefono = String(body?.telefono || body?.phone || '').trim()
  const direccion = String(body?.direccion || '').trim()
  const ubicacionGPS = String(body?.ubicacionGPS || '').trim()
  const tipoUsuario = String(body?.tipoUsuario || body?.role || '').trim()
  const businessName = String(body?.businessName || '').trim()

  const updatedUser = await User.findByIdAndUpdate(
    id,
    {
      nombre,
      documento,
      correo,
      telefono,
      direccion,
      ubicacionGPS,
      tipoUsuario,
      role: tipoUsuario,
      businessName
    },
    { new: true }
  )

  if (!updatedUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuario no encontrado.'
    })
  }

  return {
    success: true,
    message: 'Usuario actualizado exitosamente.',
    user: updatedUser.toJSON()
  }
})
