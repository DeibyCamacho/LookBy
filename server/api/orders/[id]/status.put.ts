import { Order } from '../../../models/order'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const estado = String(body?.estado || '').trim()
  const validEstados = ['Pendiente', 'En Preparación', 'Completado', 'Cancelado']

  if (!validEstados.includes(estado)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Estado no válido. Opciones permitidas: ${validEstados.join(', ')}.`
    })
  }

  const order = await Order.findByIdAndUpdate(id, { estado }, { new: true })
  if (!order) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Pedido no encontrado.'
    })
  }

  return {
    success: true,
    message: `Estado del pedido actualizado a "${estado}".`,
    data: order
  }
})
