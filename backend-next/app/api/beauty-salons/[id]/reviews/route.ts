import { NextResponse, type NextRequest } from 'next/server'
import { Review } from '@/lib/models/review'
import { BeautySalon } from '@/lib/models/beautySalon'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function POST(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()
  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json().catch(() => ({}))

  const comentario = String(body?.comentario || '').trim()
  const puntuacion = Number(body?.puntuacion)

  if (!comentario) {
    return NextResponse.json(
      { success: false, message: 'El comentario de la calificación es obligatorio.' },
      { status: 400 }
    )
  }

  if (isNaN(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return NextResponse.json(
      { success: false, message: 'La puntuación debe ser un número entero entre 1 y 5 estrellas.' },
      { status: 400 }
    )
  }

  const salon = await BeautySalon.findById(id)
  if (!salon) {
    return NextResponse.json(
      { success: false, message: 'Local de belleza no encontrado.' },
      { status: 404 }
    )
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

  return NextResponse.json({
    success: true,
    message: '¡Gracias por calificar este local de belleza!',
    data: {
      review: newReview,
      calificacionPromedio: avg,
      totalCalificaciones: salon.totalCalificaciones
    }
  })
}