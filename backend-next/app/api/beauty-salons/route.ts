import { NextResponse, type NextRequest } from 'next/server'
import { BeautySalon } from '@/lib/models/beautySalon'
import { seedDatabase } from '@/lib/seeder'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  await connectDB()
  await seedDatabase()

  const q = String(request.nextUrl.searchParams.get('q') || '').trim()

  const filter: any = {}
  if (q) {
    filter.$or = [
      { nombreLocal: { $regex: q, $options: 'i' } },
      { direccion: { $regex: q, $options: 'i' } },
      { descripcion: { $regex: q, $options: 'i' } }
    ]
  }

  const salons = await BeautySalon.find(filter).sort({ calificacionPromedio: -1 })

  return NextResponse.json({
    success: true,
    data: salons
  })
}

export async function POST(request: NextRequest) {
  await connectDB()
  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const nombreLocal = String(body?.nombreLocal || '').trim()
  const horario = String(body?.horario || 'Lunes a Sábado: 8:00 AM - 7:00 PM').trim()
  const direccion = String(body?.direccion || '').trim()
  const telefono = String(body?.telefono || '').trim()
  const descripcion = String(body?.descripcion || '').trim()
  const imagen = String(body?.imagen || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80').trim()

  if (!nombreLocal) {
    return NextResponse.json(
      { success: false, message: 'El nombre del local de belleza es obligatorio.' },
      { status: 400 }
    )
  }

  const newSalon = await BeautySalon.create({
    nombreLocal,
    horario,
    direccion,
    telefono,
    descripcion,
    imagen,
    ownerId: user._id,
    calificacionPromedio: 5.0,
    totalCalificaciones: 0
  })

  return NextResponse.json({
    success: true,
    message: 'Local de belleza registrado correctamente.',
    data: newSalon
  })
}