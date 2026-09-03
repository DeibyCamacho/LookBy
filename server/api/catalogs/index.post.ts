import { Catalog } from '../../models/catalog'
import { BeautySalon } from '../../models/beautySalon'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readBody(event)

  const idLocal = String(body?.idLocal || '').trim()
  const tipoCatalogo = String(body?.tipoCatalogo || '').trim()
  const descripcion = String(body?.descripcion || '').trim()

  if (!idLocal || !tipoCatalogo) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El ID del local y el tipo de catálogo son obligatorios.'
    })
  }

  const salon = await BeautySalon.findById(idLocal)
  if (!salon) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Local de belleza no encontrado.'
    })
  }

  const newCatalog = await Catalog.create({
    idLocal: salon._id,
    tipoCatalogo,
    descripcion
  })

  return {
    success: true,
    message: 'Catálogo creado exitosamente.',
    data: newCatalog
  }
})
