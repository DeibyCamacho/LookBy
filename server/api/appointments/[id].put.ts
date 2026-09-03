import { Appointment } from '../../models/appointment'
import { Client } from '../../models/client'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const appointment = await Appointment.findById(id)
  if (!appointment) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Cita no encontrada.'
    })
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

  return {
    success: true,
    message: 'Cita actualizada exitosamente.',
    data: appointment
  }
})
