import { BeautySalon } from '../../models/beautySalon'
import { seedDatabase } from '../../utils/seeder'

export default defineEventHandler(async (event) => {
  await seedDatabase()

  const query = getQuery(event)
  const q = String(query.q || '').trim()

  const filter: any = {}
  if (q) {
    filter.$or = [
      { nombreLocal: { $regex: q, $options: 'i' } },
      { direccion: { $regex: q, $options: 'i' } },
      { descripcion: { $regex: q, $options: 'i' } }
    ]
  }

  const salons = await BeautySalon.find(filter).sort({ calificacionPromedio: -1 })

  return {
    success: true,
    data: salons
  }
})
