import { NextResponse, type NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Client } from '@/lib/models/client'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  await connectDB()

  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const searchParams = request.nextUrl.searchParams
  const search = String(searchParams.get('q') || '').trim()

  const filter: any = {}
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }

  const clients = await Client.find(filter).sort({ name: 1 })

  return NextResponse.json({
    success: true,
    data: clients
  })
}

export async function POST(request: NextRequest) {
  await connectDB()

  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name = String(body?.name || '').trim()
  const phone = String(body?.phone || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const notes = String(body?.notes || '').trim()

  if (!name) {
    return NextResponse.json(
      { success: false, message: 'El nombre del cliente es obligatorio.' },
      { status: 400 }
    )
  }

  if (!phone) {
    return NextResponse.json(
      { success: false, message: 'El teléfono del cliente es obligatorio.' },
      { status: 400 }
    )
  }

  const newClient = await Client.create({
    name,
    phone,
    email,
    notes,
    totalVisits: 0
  })

  return NextResponse.json({
    success: true,
    message: 'Cliente registrado exitosamente.',
    data: newClient
  })
}