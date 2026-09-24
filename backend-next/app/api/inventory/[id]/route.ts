import { NextResponse, type NextRequest } from 'next/server'
import { Inventory } from '@/lib/models/inventory'
import { connectDB } from '@/lib/mongodb'
import { getAuthenticatedUser } from '@/lib/auth'

export async function DELETE(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()

  const { id } = await ctx.params
  const deletedItem = await Inventory.findByIdAndDelete(id)

  if (!deletedItem) {
    return NextResponse.json({ success: false, message: 'Producto no encontrado.' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    message: 'Producto eliminado del inventario.'
  })
}

export async function PUT(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()

  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))

  const updateData: any = {}
  if (body.name !== undefined) updateData.name = String(body.name).trim()
  if (body.sku !== undefined) updateData.sku = String(body.sku).trim()
  if (body.category !== undefined) updateData.category = String(body.category).trim()
  if (body.stock !== undefined) updateData.stock = Number(body.stock)
  if (body.minStock !== undefined) updateData.minStock = Number(body.minStock)
  if (body.unit !== undefined) updateData.unit = String(body.unit).trim()
  if (body.costPrice !== undefined) updateData.costPrice = Number(body.costPrice)
  if (body.salePrice !== undefined) updateData.salePrice = Number(body.salePrice)

  const updatedItem = await Inventory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })

  if (!updatedItem) {
    return NextResponse.json({ success: false, message: 'Producto no encontrado en inventario.' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    message: 'Inventario actualizado correctamente.',
    data: updatedItem
  })
}