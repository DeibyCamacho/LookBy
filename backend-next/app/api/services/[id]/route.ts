import { NextResponse, type NextRequest } from 'next/server'
import { Service } from '@/lib/models/service'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function PUT(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()
  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))

  const updateData: any = {}
  if (body.name !== undefined) updateData.name = String(body.name).trim()
  if (body.description !== undefined) updateData.description = String(body.description).trim()
  if (body.price !== undefined) updateData.price = Number(body.price)
  if (body.duration !== undefined) updateData.duration = Number(body.duration)
  if (body.category !== undefined) updateData.category = String(body.category).trim()
  if (body.active !== undefined) updateData.active = Boolean(body.active)

  const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })

  if (!updatedService) {
    return NextResponse.json(
      { success: false, message: 'Servicio no encontrado.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Servicio actualizado exitosamente.',
    data: updatedService
  })
}

export async function DELETE(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()
  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params
  const deletedService = await Service.findByIdAndDelete(id)

  if (!deletedService) {
    return NextResponse.json(
      { success: false, message: 'Servicio no encontrado.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Servicio eliminado correctamente.'
  })
}