import { NextResponse, type NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Appointment } from '@/lib/models/appointment'
import { Client } from '@/lib/models/client'
import { Service } from '@/lib/models/service'

export async function GET(request: NextRequest) {
  await connectDB()

  const searchParams = request.nextUrl.searchParams
  const filter: any = {}

  if (searchParams.get('status')) {
    filter.status = String(searchParams.get('status'))
  }

  if (searchParams.get('staffId')) {
    filter.staffId = String(searchParams.get('staffId'))
  }

  if (searchParams.get('date')) {
    const start = new Date(String(searchParams.get('date')))
    start.setHours(0, 0, 0, 0)
    const end = new Date(String(searchParams.get('date')))
    end.setHours(23, 59, 59, 999)
    filter.dateTime = { $gte: start, $lte: end }
  } else if (searchParams.get('from') || searchParams.get('to')) {
    filter.dateTime = {}
    if (searchParams.get('from')) filter.dateTime.$gte = new Date(String(searchParams.get('from')))
    if (searchParams.get('to')) filter.dateTime.$lte = new Date(String(searchParams.get('to')))
  }

  const appointments = await Appointment.find(filter)
    .populate('clientId', 'name phone email')
    .populate('serviceId', 'name price duration category')
    .populate('staffId', 'name email role')
    .sort({ dateTime: 1 })

  return NextResponse.json({
    success: true,
    data: appointments
  })
}

export async function POST(request: NextRequest) {
  await connectDB()

  const body = await request.json().catch(() => ({}))

  const clientName = String(body?.clientName || '').trim()
  const clientPhone = String(body?.clientPhone || '').trim()
  const clientEmail = String(body?.clientEmail || '').trim().toLowerCase()
  const serviceId = body?.serviceId
  const dateTimeStr = body?.dateTime
  const notes = String(body?.notes || '').trim()
  const staffId = body?.staffId || null

  if (!clientName || !clientPhone) {
    return NextResponse.json(
      { success: false, message: 'El nombre y teléfono del cliente son obligatorios.' },
      { status: 400 }
    )
  }

  if (!dateTimeStr) {
    return NextResponse.json(
      { success: false, message: 'La fecha y hora de la cita son obligatorias.' },
      { status: 400 }
    )
  }

  const dateTime = new Date(dateTimeStr)
  if (isNaN(dateTime.getTime())) {
    return NextResponse.json(
      { success: false, message: 'La fecha y hora proporcionadas no son válidas.' },
      { status: 400 }
    )
  }

  // Buscar o validar el servicio
  let serviceName = String(body?.serviceName || 'Servicio General')
  let price = Number(body?.price || 0)
  let duration = Number(body?.duration || 30)

  if (serviceId) {
    const service = await Service.findById(serviceId)
    if (service) {
      serviceName = service.name
      price = service.price
      duration = service.duration
    }
  }

  // Buscar o auto-crear el cliente
  let client = await Client.findOne({ phone: clientPhone })
  if (!client) {
    client = await Client.create({
      name: clientName,
      phone: clientPhone,
      email: clientEmail,
      notes: 'Registrado automáticamente desde reserva de cita',
      totalVisits: 0
    })
  }

  const newAppointment = await Appointment.create({
    clientId: client._id,
    serviceId: serviceId || null,
    staffId: staffId || null,
    clientName,
    clientPhone,
    serviceName,
    price,
    dateTime,
    duration,
    status: 'pendiente',
    notes
  })

  return NextResponse.json({
    success: true,
    message: 'Cita programada con éxito.',
    data: newAppointment
  })
}