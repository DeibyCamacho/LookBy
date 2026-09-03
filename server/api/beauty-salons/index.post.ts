import { BeautySalon } from '../../models/beautySalon'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const nombreLocal = String(body?.nombreLocal || '').trim()
  const horario = String(body?.horario || 'Lunes a Sábado: 8:00 AM - 7:00 PM').trim()
  const direccion = String(body?.direccion || '').trim()
  const telefono = String(body?.telefono || '').trim()
  const descripcion = String(body?.descripcion || '').trim()
  const imagen = String(body?.imagen || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80').trim()

  if (!nombreLocal) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre del local de belleza es obligatorio.'
    })
  }

  const newSalon = await BeautySalon.create({
    nombreLocal,
    horario,
    direccion,
    telefono,
    descripcion,
    imagen,
    ownerId: user._id,
    calificacionPromedio: 5.0,
    totalCalificaciones: 0
  })

  return {
    success: true,
    message: 'Local de belleza registrado correctamente.',
    data: newSalon
  }
})
