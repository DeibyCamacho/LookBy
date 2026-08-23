import { Service } from '../../models/service'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const price = Number(body?.price)
  const duration = Number(body?.duration || 30)
  const category = String(body?.category || 'General').trim()
  const description = String(body?.description || '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre del servicio es obligatorio.'
    })
  }

  if (isNaN(price) || price < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El precio debe ser un número válido mayor o igual a 0.'
    })
  }

  const newService = await Service.create({
    name,
    description,
    price,
    duration,
    category,
    active: true
  })

  return {
    success: true,
    message: 'Servicio creado exitosamente.',
    data: newService
  }
})
