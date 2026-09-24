import { NextResponse, type NextRequest } from 'next/server'
import { Role } from '@/lib/models/role'
import { UserRole } from '@/lib/models/userRole'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  await connectDB()

  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  if (user.tipoUsuario !== 'admin' && user.role !== 'admin') {
    return NextResponse.json({
      success: false,
      message: 'Acceso exclusivo para administradores.'
    }, { status: 403 })
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

  return NextResponse.json({
    success: true,
    data: rolesWithStats
  })
}