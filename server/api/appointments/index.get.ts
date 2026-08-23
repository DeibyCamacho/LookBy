import { Appointment } from '../../models/appointment'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const filter: any = {}

  if (query.status) {
    filter.status = String(query.status)
  }

  if (query.staffId) {
    filter.staffId = String(query.staffId)
  }

  if (query.date) {
    const start = new Date(String(query.date))
    start.setHours(0, 0, 0, 0)
    const end = new Date(String(query.date))
    end.setHours(23, 59, 59, 999)
    filter.dateTime = { $gte: start, $lte: end }
  } else if (query.from || query.to) {
    filter.dateTime = {}
    if (query.from) filter.dateTime.$gte = new Date(String(query.from))
    if (query.to) filter.dateTime.$lte = new Date(String(query.to))
  }

  const appointments = await Appointment.find(filter)
    .populate('clientId', 'name phone email')
    .populate('serviceId', 'name price duration category')
    .populate('staffId', 'name email role')
    .sort({ dateTime: 1 })

  return {
    success: true,
    data: appointments
  }
})
