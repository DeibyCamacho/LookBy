import { Review } from '../../../models/review'
import { BeautySalon } from '../../../models/beautySalon'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const salonId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const comentario = String(body?.comentario || '').trim()
  const puntuacion = Number(body?.puntuacion)

  if (!comentario) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El comentario de la calificación es obligatorio.'
    })
  }

  if (isNaN(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La puntuación debe ser un número entero entre 1 y 5 estrellas.'
    })
  }

  const salon = await BeautySalon.findById(salonId)
  if (!salon) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Local de belleza no encontrado.'
    })
  }

  // Crear o actualizar la calificación del usuario para este local
  const newReview = await Review.create({
    idLocal: salon._id,
    idUsuario: user._id,
    comentario,
    puntuacion: Math.round(puntuacion),
    fecha: new Date()
  })

  // Recalcular la calificación promedio (calificacionPromedio) del local
  const allReviews = await Review.find({ idLocal: salon._id })
  const totalScore = allReviews.reduce((sum, r) => sum + r.puntuacion, 0)
  const avg = parseFloat((totalScore / allReviews.length).toFixed(1))

  salon.calificacionPromedio = avg
  salon.totalCalificaciones = allReviews.length
  await salon.save()

  return {
    success: true,
    message: '¡Gracias por calificar este local de belleza!',
    data: {
      review: newReview,
      calificacionPromedio: avg,
      totalCalificaciones: salon.totalCalificaciones
    }
  }
})
