import { NextResponse, type NextRequest } from 'next/server'
import { User } from '@/lib/models/user'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  await connectDB()

  const currentUser = await getAuthenticatedUser(request)
  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }

  // Solo administradores de plataforma pueden acceder a este endpoint
  if (currentUser.tipoUsuario !== 'admin' && currentUser.role !== 'admin') {
    return NextResponse.json({
      success: false,
      message: 'Acceso denegado. Solo administradores pueden gestionar usuarios.'
    }, { status: 403 })
  }

  const searchParams = request.nextUrl.searchParams
  const filter: any = {}

  const role = searchParams.get('role')
  if (role) {
    const r = String(role)
    filter.$or = [{ tipoUsuario: r }, { role: r }]
  }

  const q = searchParams.get('q')
  if (q) {
    const search = String(q).trim()
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

  return NextResponse.json({
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
  })
}