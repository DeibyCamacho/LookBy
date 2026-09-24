import { NextResponse, type NextRequest } from 'next/server'
import { Service } from '@/lib/models/service'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  await connectDB()

  const filter: any = {}

  const category = request.nextUrl.searchParams.get('category')
  if (category) {
    filter.category = String(category)
  }

  const active = request.nextUrl.searchParams.get('active')
  if (active !== null) {
    filter.active = active === 'true'
  }

  const services = await Service.find(filter).sort({ name: 1 })

  return NextResponse.json({
    success: true,
    data: services
  })
}

export async function POST(request: NextRequest) {
  await connectDB()
  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => ({}))

  const name = String(body?.name || '').trim()
  const price = Number(body?.price)
  const duration = Number(body?.duration || 30)
  const category = String(body?.category || 'General').trim()
  const description = String(body?.description || '').trim()

  if (!name) {
    return NextResponse.json(
      { success: false, message: 'El nombre del servicio es obligatorio.' },
      { status: 400 }
    )
  }

  if (isNaN(price) || price < 0) {
    return NextResponse.json(
      { success: false, message: 'El precio debe ser un número válido mayor o igual a 0.' },
      { status: 400 }
    )
  }

  const newService = await Service.create({
    name,
    description,
    price,
    duration,
    category,
    active: true
  })

  return NextResponse.json({
    success: true,
    message: 'Servicio creado exitosamente.',
    data: newService
  })
}