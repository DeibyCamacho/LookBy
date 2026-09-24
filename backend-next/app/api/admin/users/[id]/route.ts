import { NextResponse, type NextRequest } from 'next/server'
import { User } from '@/lib/models/user'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function PUT(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()

  const currentUser = await getAuthenticatedUser(request)
  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  if (currentUser.tipoUsuario !== 'admin' && currentUser.role !== 'admin') {
    return NextResponse.json({
      success: false,
      message: 'Acceso denegado. Solo administradores pueden modificar usuarios.'
    }, { status: 403 })
  }

  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))

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
    return NextResponse.json({
      success: false,
      message: 'Usuario no encontrado.'
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    message: 'Usuario actualizado exitosamente.',
    user: updatedUser.toJSON()
  })
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()

  const currentUser = await getAuthenticatedUser(request)
  if (!currentUser) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  if (currentUser.role !== 'admin') {
    return NextResponse.json({
      success: false,
      message: 'Acceso denegado. Solo administradores pueden eliminar usuarios.'
    }, { status: 403 })
  }

  const { id } = await ctx.params

  // No permitir que el admin se elimine a sí mismo
  if (id === currentUser._id.toString()) {
    return NextResponse.json({
      success: false,
      message: 'No puedes eliminar tu propia cuenta de administrador.'
    }, { status: 400 })
  }

  const deletedUser = await User.findByIdAndDelete(id)

  if (!deletedUser) {
    return NextResponse.json({
      success: false,
      message: 'Usuario no encontrado.'
    }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    message: 'Usuario eliminado del sistema.'
  })
}