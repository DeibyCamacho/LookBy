import { NextResponse, type NextRequest } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Appointment } from '@/lib/models/appointment'
import { Client } from '@/lib/models/client'
import { getAuthenticatedUser } from '@/lib/auth'

export async function DELETE(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()

  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params
  const deletedAppointment = await Appointment.findByIdAndDelete(id)

  if (!deletedAppointment) {
    return NextResponse.json(
      { success: false, message: 'Cita no encontrada.' },
      { status: 404 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Cita eliminada correctamente.'
  })
}

export async function PUT(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()

  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))

  const appointment = await Appointment.findById(id)
  if (!appointment) {
    return NextResponse.json(
      { success: false, message: 'Cita no encontrada.' },
      { status: 404 }
    )
  }

  const previousStatus = appointment.status

  if (body.status !== undefined) appointment.status = body.status
  if (body.dateTime !== undefined) appointment.dateTime = new Date(body.dateTime)
  if (body.duration !== undefined) appointment.duration = Number(body.duration)
  if (body.price !== undefined) appointment.price = Number(body.price)
  if (body.notes !== undefined) appointment.notes = String(body.notes).trim()
  if (body.staffId !== undefined) appointment.staffId = body.staffId || null

  await appointment.save()

  // Si cambió a completada, incrementamos las visitas del cliente
  if (previousStatus !== 'completada' && appointment.status === 'completada' && appointment.clientId) {
    await Client.findByIdAndUpdate(appointment.clientId, { $inc: { totalVisits: 1 } })
  }

  return NextResponse.json({
    success: true,
    message: 'Cita actualizada exitosamente.',
    data: appointment
  })
}