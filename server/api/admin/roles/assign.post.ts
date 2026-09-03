import { UserRole } from '../../../models/userRole'
import { Role } from '../../../models/role'
import { User } from '../../../models/user'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  if (user.tipoUsuario !== 'admin' && user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso exclusivo para administradores.'
    })
  }

  const body = await readBody(event)
  const idUsuario = String(body?.idUsuario || '').trim()
  const roleName = String(body?.roleName || '').trim().toLowerCase()
  const descripcion = String(body?.descripcion || `Asignación manual de rol ${roleName}`).trim()

  if (!idUsuario || !roleName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El ID de usuario y el nombre del rol son requeridos.'
    })
  }

  const targetUser = await User.findById(idUsuario)
  if (!targetUser) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuario no encontrado.'
    })
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

  return {
    success: true,
    message: `Rol ${roleName} asignado exitosamente al usuario ${targetUser.nombre}.`,
    data: {
      user: targetUser.toJSON(),
      userRole
    }
  }
})
