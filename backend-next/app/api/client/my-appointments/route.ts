import { NextResponse, type NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Appointment } from '@/lib/models/appointment'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  await connectDB()

  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  // Buscar citas asociadas al cliente por teléfono, email o nombre
  const filter: any = {
    $or: []
  }

  if (user.phone) {
    filter.$or.push({ clientPhone: user.phone })
  }
  if (user.email) {
    filter.$or.push({ clientEmail: user.email })
  }
  if (user.name) {
    filter.$or.push({ clientName: user.name })
  }

  if (filter.$or.length === 0) {
    return NextResponse.json({
      success: true,
      data: []
    })
  }

  const appointments = await Appointment.find(filter)
    .sort({ dateTime: -1 })

  return NextResponse.json({
    success: true,
    data: appointments
  })
}