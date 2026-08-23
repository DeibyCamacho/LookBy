import { Inventory } from '../../models/inventory'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)
  const name = String(body?.name || '').trim()
  const sku = String(body?.sku || '').trim()
  const category = String(body?.category || 'General').trim()
  const stock = Number(body?.stock || 0)
  const minStock = Number(body?.minStock || 5)
  const unit = String(body?.unit || 'unidades').trim()
  const costPrice = Number(body?.costPrice || 0)
  const salePrice = Number(body?.salePrice || 0)

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre del producto es obligatorio.'
    })
  }

  const newItem = await Inventory.create({
    name,
    sku,
    category,
    stock,
    minStock,
    unit,
    costPrice,
    salePrice
  })

  return {
    success: true,
    message: 'Producto añadido al inventario.',
    data: newItem
  }
})
