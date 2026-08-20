import { Service } from '../../models/service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const filter: any = {}

  if (query.category) {
    filter.category = String(query.category)
  }

  if (query.active !== undefined) {
    filter.active = query.active === 'true'
  }

  const services = await Service.find(filter).sort({ name: 1 })

  return {
    success: true,
    data: services
  }
})
