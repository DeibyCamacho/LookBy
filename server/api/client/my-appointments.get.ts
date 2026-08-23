import { Appointment } from '../../models/appointment'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

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
    return {
      success: true,
      data: []
    }
  }

  const appointments = await Appointment.find(filter)
    .sort({ dateTime: -1 })

  return {
    success: true,
    data: appointments
  }
})
