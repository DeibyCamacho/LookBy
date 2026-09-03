import { Appointment } from '../../models/appointment'
import { Client } from '../../models/client'
import { Service } from '../../models/service'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const clientName = String(body?.clientName || '').trim()
  const clientPhone = String(body?.clientPhone || '').trim()
  const clientEmail = String(body?.clientEmail || '').trim().toLowerCase()
  const serviceId = body?.serviceId
  const dateTimeStr = body?.dateTime
  const notes = String(body?.notes || '').trim()
  const staffId = body?.staffId || null

  if (!clientName || !clientPhone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre y teléfono del cliente son obligatorios.'
    })
  }

  if (!dateTimeStr) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La fecha y hora de la cita son obligatorias.'
    })
  }

  const dateTime = new Date(dateTimeStr)
  if (isNaN(dateTime.getTime())) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La fecha y hora proporcionadas no son válidas.'
    })
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

  return {
    success: true,
    message: 'Cita programada con éxito.',
    data: newAppointment
  }
})
