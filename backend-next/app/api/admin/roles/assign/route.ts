import { NextResponse, type NextRequest } from 'next/server'
import { UserRole } from '@/lib/models/userRole'
import { Role } from '@/lib/models/role'
import { User } from '@/lib/models/user'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
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

  const body = await request.json().catch(() => ({}))
  const idUsuario = String(body?.idUsuario || '').trim()
  const roleName = String(body?.roleName || '').trim().toLowerCase()
  const descripcion = String(body?.descripcion || `Asignación manual de rol ${roleName}`).trim()

  if (!idUsuario || !roleName) {
    return NextResponse.json({
      success: false,
      message: 'El ID de usuario y el nombre del rol son requeridos.'
    }, { status: 400 })
  }

  const targetUser = await User.findById(idUsuario)
  if (!targetUser) {
    return NextResponse.json({
      success: false,
      message: 'Usuario no encontrado.'
    }, { status: 404 })
  }

  let roleDoc = await Role.findOne({ nombre: roleName })
  if (!roleDoc) {
    roleDoc = await Role.create({
      nombre: roleName,
      descripcion: `Rol de ${roleName} en LookBy`
    })
  }

  // Actualizar tipoUsuario en modelo User
  targetUser.tipoUsuario = roleName
  targetUser.role = roleName as any
  await targetUser.save()

  // Actualizar o crear USUARIO_ROL
  const userRole = await UserRole.findOneAndUpdate(
    { idUsuario: targetUser._id },
    { idRol: roleDoc._id, descripcion },
    { upsert: true, new: true }
  ).populate('idRol')

  return NextResponse.json({
    success: true,
    message: `Rol ${roleName} asignado exitosamente al usuario ${targetUser.nombre}.`,
    data: {
      user: targetUser.toJSON(),
      userRole
    }
  })
}