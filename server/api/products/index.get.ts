import { Product } from '../../models/product'
import { seedDatabase } from '../../utils/seeder'

export default defineEventHandler(async (event) => {
  await seedDatabase()

  const query = getQuery(event)
  const q = String(query.q || '').trim()
  const categoria = String(query.categoria || '').trim()

  const filter: any = {}
  if (q) {
    filter.$or = [
      { nombre: { $regex: q, $options: 'i' } },
      { descripcion: { $regex: q, $options: 'i' } }
    ]
  }

  if (categoria) {
    filter.categoria = categoria
  }

  const products = await Product.find(filter).sort({ nombre: 1 })

  return {
    success: true,
    data: products
  }
})
