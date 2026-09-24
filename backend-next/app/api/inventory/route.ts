import { NextResponse, type NextRequest } from 'next/server'
import { Inventory } from '@/lib/models/inventory'
import { connectDB } from '@/lib/mongodb'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()

  const query = request.nextUrl.searchParams
  const filter: any = {}

  if (query.get('category')) {
    filter.category = String(query.get('category'))
  }

  // Filtrar solo productos con stock bajo
  if (query.get('lowStock') === 'true') {
    filter.$expr = { $lte: ['$stock', '$minStock'] }
  }

  const items = await Inventory.find(filter).sort({ name: 1 })

  return NextResponse.json({
    success: true,
    data: items
  })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()

  const body = await request.json().catch(() => ({}))
  const name = String(body?.name || '').trim()
  const sku = String(body?.sku || '').trim()
  const category = String(body?.category || 'General').trim()
  const stock = Number(body?.stock || 0)
  const minStock = Number(body?.minStock || 5)
  const unit = String(body?.unit || 'unidades').trim()
  const costPrice = Number(body?.costPrice || 0)
  const salePrice = Number(body?.salePrice || 0)

  if (!name) {
    return NextResponse.json({ success: false, message: 'El nombre del producto es obligatorio.' }, { status: 400 })
  }

  const newItem = await Inventory.create({
    name,
    sku,
    category,
    stock,
    minStock,
    unit,
    costPrice,
    salePrice
  })

  return NextResponse.json({
    success: true,
    message: 'Producto añadido al inventario.',
    data: newItem
  })
}