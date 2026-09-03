import { CatalogProductDetail } from '../../../models/catalogProductDetail'
import { Catalog } from '../../../models/catalog'
import { Product } from '../../../models/product'
import { requireAuth } from '../../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const catalogId = getRouterParam(event, 'id')
  const body = await readBody(event)

  const idProducto = String(body?.idProducto || '').trim()
  const stockDisponible = Number(body?.stockDisponible ?? 10)
  const precioLocal = Number(body?.precioLocal)
  const disponibilidad = Boolean(body?.disponibilidad ?? true)

  if (!idProducto || isNaN(precioLocal) || precioLocal < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El producto y el precio local válido son obligatorios.'
    })
  }

  const catalog = await Catalog.findById(catalogId)
  if (!catalog) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Catálogo no encontrado.'
    })
  }

  const product = await Product.findById(idProducto)
  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Producto no encontrado en el maestro de productos.'
    })
  }

  const item = await CatalogProductDetail.findOneAndUpdate(
    { idCatalogo: catalog._id, idProducto: product._id },
    {
      stockDisponible: Math.max(0, stockDisponible),
      precioLocal,
      disponibilidad
    },
    { upsert: true, new: true }
  ).populate('idProducto')

  return {
    success: true,
    message: 'Producto asociado al catálogo exitosamente.',
    data: item
  }
})
