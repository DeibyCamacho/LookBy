import { NextResponse, type NextRequest } from 'next/server'
import { Order } from '@/lib/models/order'
import { connectDB } from '@/lib/mongodb'
import { getAuthenticatedUser } from '@/lib/auth'

export async function PUT(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))

  const estado = String(body?.estado || '').trim()
  const validEstados = ['Pendiente', 'En Preparación', 'Completado', 'Cancelado']

  if (!validEstados.includes(estado)) {
    return NextResponse.json({ success: false, message: `Estado no válido. Opciones permitidas: ${validEstados.join(', ')}.` }, { status: 400 })
  }

  const order = await Order.findByIdAndUpdate(id, { estado }, { new: true })
  if (!order) {
    return NextResponse.json({ success: false, message: 'Pedido no encontrado.' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    message: `Estado del pedido actualizado a "${estado}".`,
    data: order
  })
}