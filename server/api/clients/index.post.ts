import { Client } from '../../models/client'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)
  const name = String(body?.name || '').trim()
  const phone = String(body?.phone || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const notes = String(body?.notes || '').trim()

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre del cliente es obligatorio.'
    })
  }

  if (!phone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El teléfono del cliente es obligatorio.'
    })
  }

  const newClient = await Client.create({
    name,
    phone,
    email,
    notes,
    totalVisits: 0
  })

  return {
    success: true,
    message: 'Cliente registrado exitosamente.',
    data: newClient
  }
})
