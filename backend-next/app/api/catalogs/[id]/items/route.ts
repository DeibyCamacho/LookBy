import { NextResponse, type NextRequest } from 'next/server'
import { CatalogProductDetail } from '@/lib/models/catalogProductDetail'
import { Catalog } from '@/lib/models/catalog'
import { Product } from '@/lib/models/product'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function GET(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()
  const { id } = await ctx.params

  const items = await CatalogProductDetail.find({ idCatalogo: id }).populate('idProducto')

  return NextResponse.json({
    success: true,
    data: items
  })
}

export async function POST(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()
  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))

  const idProducto = String(body?.idProducto || '').trim()
  const stockDisponible = Number(body?.stockDisponible ?? 10)
  const precioLocal = Number(body?.precioLocal)
  const disponibilidad = Boolean(body?.disponibilidad ?? true)

  if (!idProducto || isNaN(precioLocal) || precioLocal < 0) {
    return NextResponse.json(
      { success: false, message: 'El producto y el precio local válido son obligatorios.' },
      { status: 400 }
    )
  }

  const catalog = await Catalog.findById(id)
  if (!catalog) {
    return NextResponse.json(
      { success: false, message: 'Catálogo no encontrado.' },
      { status: 404 }
    )
  }

  const product = await Product.findById(idProducto)
  if (!product) {
    return NextResponse.json(
      { success: false, message: 'Producto no encontrado en el maestro de productos.' },
      { status: 404 }
    )
  }

  const item = await CatalogProductDetail.findOneAndUpdate(
    { idCatalogo: catalog._id, idProducto: product._id },
    {
      stockDisponible: Math.max(0, stockDisponible),
      precioLocal,
      disponibilidad
    },
    { upsert: true, new: true }
  ).populate('idProducto')

  return NextResponse.json({
    success: true,
    message: 'Producto asociado al catálogo exitosamente.',
    data: item
  })
}