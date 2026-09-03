import { User } from '../../../models/user'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)

  // Solo administradores de plataforma pueden acceder a este endpoint
  if (currentUser.tipoUsuario !== 'admin' && currentUser.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado. Solo administradores pueden gestionar usuarios.'
    })
  }

  const query = getQuery(event)
  const filter: any = {}

  if (query.role) {
    const r = String(query.role)
    filter.$or = [{ tipoUsuario: r }, { role: r }]
  }

  if (query.q) {
    const search = String(query.q).trim()
    filter.$or = [
      { nombre: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { documento: { $regex: search, $options: 'i' } },
      { correo: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { telefono: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { businessName: { $regex: search, $options: 'i' } }
    ]
  }

  const users = await User.find(filter).sort({ createdAt: -1 })

  // Conteo por roles para métricas de superadmin
  const [totalAdmin, totalProfesional, totalProveedor, totalCliente] = await Promise.all([
    User.countDocuments({ $or: [{ tipoUsuario: 'admin' }, { role: 'admin' }] }),
    User.countDocuments({ $or: [{ tipoUsuario: 'profesional' }, { role: 'profesional' }] }),
    User.countDocuments({ $or: [{ tipoUsuario: 'proveedor' }, { role: 'proveedor' }] }),
    User.countDocuments({ $or: [{ tipoUsuario: 'cliente' }, { role: 'cliente' }] })
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
