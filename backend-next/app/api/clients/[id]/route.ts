import { NextResponse, type NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Client } from '@/lib/models/client'
import { getAuthenticatedUser } from '@/lib/auth'

export async function DELETE(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()

  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params
  const deletedClient = await Client.findByIdAndDelete(id)

  if (!deletedClient) {
    return NextResponse.json(
      { success: false, message: 'Cliente no encontrado.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Cliente eliminado correctamente.'
  })
}

export async function PUT(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()

  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))

  const updateData: any = {}
  if (body.name !== undefined) updateData.name = String(body.name).trim()
  if (body.phone !== undefined) updateData.phone = String(body.phone).trim()
  if (body.email !== undefined) updateData.email = String(body.email).trim().toLowerCase()
  if (body.notes !== undefined) updateData.notes = String(body.notes).trim()
  if (body.totalVisits !== undefined) updateData.totalVisits = Number(body.totalVisits)

  const updatedClient = await Client.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })

  if (!updatedClient) {
    return NextResponse.json(
      { success: false, message: 'Cliente no encontrado.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Cliente actualizado exitosamente.',
    data: updatedClient
  })
}