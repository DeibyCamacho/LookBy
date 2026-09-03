import { Supplier } from '../../models/supplier'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const razonSocial = String(body?.razonSocial || '').trim()
  const contacto = String(body?.contacto || '').trim()
  const direccion = String(body?.direccion || '').trim()
  const nit = String(body?.nit || '').trim()

  if (!razonSocial || !contacto) {
    throw createError({
      statusCode: 400,
      statusMessage: 'La razón social y el contacto del proveedor son obligatorios.'
    })
  }

  const supplier = await Supplier.create({
    razonSocial,
    contacto,
    direccion,
    nit,
    userId: user._id
  })

  return {
    success: true,
    message: 'Perfil de proveedor registrado exitosamente.',
    data: supplier
  }
})
