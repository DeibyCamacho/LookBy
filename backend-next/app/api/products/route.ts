import { NextResponse, type NextRequest } from 'next/server'
import { Product } from '@/lib/models/product'
import { connectDB } from '@/lib/mongodb'
import { seedDatabase } from '@/lib/seeder'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  await connectDB()
  await seedDatabase()

  const query = request.nextUrl.searchParams
  const q = String(query.get('q') || '').trim()
  const categoria = String(query.get('categoria') || '').trim()

  const filter: any = {}
  if (q) {
    filter.$or = [
      { nombre: { $regex: q, $options: 'i' } },
      { descripcion: { $regex: q, $options: 'i' } }
    ]
  }

  if (categoria) {
    filter.categoria = categoria
  }

  const products = await Product.find(filter).sort({ nombre: 1 })

  return NextResponse.json({
    success: true,
    data: products
  })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  const body = await request.json().catch(() => ({}))

  const nombre = String(body?.nombre || '').trim()
  const descripcion = String(body?.descripcion || '').trim()
  const precio = Number(body?.precio)
  const imagen = String(body?.imagen || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80').trim()
  const categoria = String(body?.categoria || 'General').trim()

  if (!nombre || isNaN(precio) || precio < 0) {
    return NextResponse.json({ success: false, message: 'El nombre y un precio válido son obligatorios.' }, { status: 400 })
  }

  const product = await Product.create({
    nombre,
    descripcion,
    precio,
    imagen,
    categoria
  })

  return NextResponse.json({
    success: true,
    message: 'Producto registrado exitosamente en el catálogo maestro.',
    data: product
  })
}