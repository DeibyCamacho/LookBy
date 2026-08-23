import { Inventory } from '../../models/inventory'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const updateData: any = {}
  if (body.name !== undefined) updateData.name = String(body.name).trim()
  if (body.sku !== undefined) updateData.sku = String(body.sku).trim()
  if (body.category !== undefined) updateData.category = String(body.category).trim()
  if (body.stock !== undefined) updateData.stock = Number(body.stock)
  if (body.minStock !== undefined) updateData.minStock = Number(body.minStock)
  if (body.unit !== undefined) updateData.unit = String(body.unit).trim()
  if (body.costPrice !== undefined) updateData.costPrice = Number(body.costPrice)
  if (body.salePrice !== undefined) updateData.salePrice = Number(body.salePrice)

  const updatedItem = await Inventory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })

  if (!updatedItem) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Producto no encontrado en inventario.'
    })
  }

  return {
    success: true,
    message: 'Inventario actualizado correctamente.',
    data: updatedItem
  }
})
