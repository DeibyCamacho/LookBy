import { NextResponse, type NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Appointment } from '@/lib/models/appointment'

export async function GET(request: NextRequest) {
  await connectDB()

  const searchParams = request.nextUrl.searchParams
  const dateStr = String(searchParams.get('date') || '').trim()

  if (!dateStr) {
    return NextResponse.json({
      success: true,
      data: []
    })
  }

  // Rango del día completo
  const startOfDay = new Date(dateStr + 'T00:00:00.000Z')
  const endOfDay = new Date(dateStr + 'T23:59:59.999Z')

  const appointments = await Appointment.find({
    dateTime: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    status: { $ne: 'cancelada' }
  }).select('dateTime duration')

  // Extraer las horas en formato HH:mm
  const occupiedTimes = appointments.map((app) => {
    const d = new Date(app.dateTime)
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  })

  return NextResponse.json({
    success: true,
    data: occupiedTimes
  })
}