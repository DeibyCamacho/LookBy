import { Client } from '../../models/client'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const search = String(query.q || '').trim()

  const filter: any = {}
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  }

  const clients = await Client.find(filter).sort({ name: 1 })

  return {
    success: true,
    data: clients
  }
})
