import { Role } from '../../../models/role'
import { UserRole } from '../../../models/userRole'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.tipoUsuario !== 'admin' && user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso exclusivo para administradores.'
    })
  }

  const roles = await Role.find().sort({ nombre: 1 })

  const rolesWithStats = await Promise.all(
    roles.map(async (r) => {
      const userCount = await UserRole.countDocuments({ idRol: r._id })
      return {
        _id: r._id,
        nombre: r.nombre,
        descripcion: r.descripcion,
        userCount,
        createdAt: r.createdAt
      }
    })
  )

  return {
    success: true,
    data: rolesWithStats
  }
})
