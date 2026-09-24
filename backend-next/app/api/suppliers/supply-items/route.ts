import { NextResponse, type NextRequest } from 'next/server'
import { SupplierProductDetail } from '@/lib/models/supplierProductDetail'
import { Supplier } from '@/lib/models/supplier'
import { Product } from '@/lib/models/product'
import { connectDB } from '@/lib/mongodb'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  const body = await request.json().catch(() => ({}))

  const idProveedor = String(body?.idProveedor || '').trim()
  const idProducto = String(body?.idProducto || '').trim()
  const precioMayoreo = Number(body?.precioMayoreo)
  const stockProveedor = Number(body?.stockProveedor ?? 100)
  const tiempoEntrega = String(body?.tiempoEntrega || '24 a 48 horas').trim()

  if (!idProveedor || !idProducto || isNaN(precioMayoreo) || precioMayoreo < 0) {
    return NextResponse.json({ success: false, message: 'El proveedor, producto y precio mayorista válido son obligatorios.' }, { status: 400 })
  }

  const supplier = await Supplier.findById(idProveedor)
  if (!supplier) {
    return NextResponse.json({ success: false, message: 'Proveedor no encontrado.' }, { status: 404 })
  }

  const product = await Product.findById(idProducto)
  if (!product) {
    return NextResponse.json({ success: false, message: 'Producto no encontrado.' }, { status: 404 })
  }

  const supplyDetail = await SupplierProductDetail.findOneAndUpdate(
    { idProveedor: supplier._id, idProducto: product._id },
    {
      precioMayoreo,
      stockProveedor: Math.max(0, stockProveedor),
      tiempoEntrega
    },
    { upsert: true, new: true }
  ).populate('idProducto')

  return NextResponse.json({
    success: true,
    message: 'Oferta mayorista publicada exitosamente.',
    data: supplyDetail
  })
}