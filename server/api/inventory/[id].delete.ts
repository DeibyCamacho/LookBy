import { Inventory } from '../../models/inventory'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const deletedItem = await Inventory.findByIdAndDelete(id)

  if (!deletedItem) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Producto no encontrado.'
    })
  }

  return {
    success: true,
    message: 'Producto eliminado del inventario.'
  }
})
