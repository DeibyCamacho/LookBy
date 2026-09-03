import { SupplierProductDetail } from '../../models/supplierProductDetail'
import { Supplier } from '../../models/supplier'
import { Product } from '../../models/product'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const body = await readBody(event)

  const idProveedor = String(body?.idProveedor || '').trim()
  const idProducto = String(body?.idProducto || '').trim()
  const precioMayoreo = Number(body?.precioMayoreo)
  const stockProveedor = Number(body?.stockProveedor ?? 100)
  const tiempoEntrega = String(body?.tiempoEntrega || '24 a 48 horas').trim()

  if (!idProveedor || !idProducto || isNaN(precioMayoreo) || precioMayoreo < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El proveedor, producto y precio mayorista válido son obligatorios.'
    })
  }

  const supplier = await Supplier.findById(idProveedor)
  if (!supplier) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Proveedor no encontrado.'
    })
  }

  const product = await Product.findById(idProducto)
  if (!product) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Producto no encontrado.'
    })
  }

  const supplyDetail = await SupplierProductDetail.findOneAndUpdate(
    { idProveedor: supplier._id, idProducto: product._id },
    {
      precioMayoreo,
      stockProveedor: Math.max(0, stockProveedor),
      tiempoEntrega
    },
    { upsert: true, new: true }
  ).populate('idProducto')

  return {
    success: true,
    message: 'Oferta mayorista publicada exitosamente.',
    data: supplyDetail
  }
})
