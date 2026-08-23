import { Appointment } from '../../models/appointment'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const dateStr = String(query.date || '').trim()

  if (!dateStr) {
    return {
      success: true,
      data: []
    }
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

  return {
    success: true,
    data: occupiedTimes
  }
})
