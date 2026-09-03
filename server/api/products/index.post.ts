import { Product } from '../../models/product'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readBody(event)

  const nombre = String(body?.nombre || '').trim()
  const descripcion = String(body?.descripcion || '').trim()
  const precio = Number(body?.precio)
  const imagen = String(body?.imagen || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80').trim()
  const categoria = String(body?.categoria || 'General').trim()

  if (!nombre || isNaN(precio) || precio < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El nombre y un precio válido son obligatorios.'
    })
  }

  const product = await Product.create({
    nombre,
    descripcion,
    precio,
    imagen,
    categoria
  })

  return {
    success: true,
    message: 'Producto registrado exitosamente en el catálogo maestro.',
    data: product
  }
})
