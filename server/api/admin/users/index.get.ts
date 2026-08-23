import { User } from '../../../models/user'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)

  // Solo administradores de plataforma pueden acceder a este endpoint
  if (currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Solo administradores pueden gestionar usuarios.'
    })
  }

  const query = getQuery(event)
  const filter: any = {}

  if (query.role) {
    filter.role = String(query.role)
  }

  if (query.q) {
    const search = String(query.q).trim()
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } }
    ]
  }

  const users = await User.find(filter).sort({ createdAt: -1 })

  // Conteo por roles para métricas de superadmin
  const [totalAdmin, totalProfesional, totalProveedor, totalCliente] = await Promise.all([
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'profesional' }),
    User.countDocuments({ role: 'proveedor' }),
    User.countDocuments({ role: 'cliente' })
  ])

  return {
    success: true,
    data: {
      users,
      counts: {
        total: users.length,
        admin: totalAdmin,
        profesional: totalProfesional,
        proveedor: totalProveedor,
        cliente: totalCliente
      }
    }
  }
})
