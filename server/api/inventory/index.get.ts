import { Inventory } from '../../models/inventory'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const filter: any = {}

  if (query.category) {
    filter.category = String(query.category)
  }

  // Filtrar solo productos con stock bajo
  if (query.lowStock === 'true') {
    filter.$expr = { $lte: ['$stock', '$minStock'] }
  }

  const items = await Inventory.find(filter).sort({ name: 1 })

  return {
    success: true,
    data: items
  }
})
