import { Appointment } from '../../models/appointment'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const deletedAppointment = await Appointment.findByIdAndDelete(id)

  if (!deletedAppointment) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Cita no encontrada.'
    })
  }

  return {
    success: true,
    message: 'Cita eliminada correctamente.'
  }
})
