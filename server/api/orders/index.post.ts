import { Order } from '../../models/order'
import { OrderDetail } from '../../models/orderDetail'
import { Product } from '../../models/product'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)

  const idLocal = body?.idLocal || null
  const items = Array.isArray(body?.items) ? body.items : []
  const direccionEntrega = String(body?.direccionEntrega || user.direccion || '').trim()
  const notas = String(body?.notas || '').trim()

  if (!items || items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El pedido debe contener al menos un producto.'
    })
  }

  // Validar y calcular montos de cada detalle (DET_PEDIDO)
  let montoTotal = 0
  const validatedDetails = []

  for (const it of items) {
    const productId = it.idProducto || it.productId
    const cantidad = Math.max(1, parseInt(it.cantidad || 1, 10))

    const product = await Product.findById(productId)
    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: `Producto no encontrado (ID: ${productId}).`
      })
    }

    const precioUnitario = Number(it.precioUnitario ?? product.precio)
    const subTotal = precioUnitario * cantidad
    montoTotal += subTotal

    validatedDetails.push({
      idProducto: product._id,
      cantidad,
      precioUnitario,
      subTotal
    })
  }

  // 1. Crear el Pedido (PEDIDO)
  const order = await Order.create({
    idUsuario: user._id,
    idLocal,
    fecha: new Date(),
    estado: 'Pendiente',
    montoTotal,
    direccionEntrega,
    notas
  })

  // 2. Crear los Detalles del Pedido (DET_PEDIDO)
  const createdDetails = await Promise.all(
    validatedDetails.map((det) =>
      OrderDetail.create({
        idPedido: order._id,
        idProducto: det.idProducto,
        cantidad: det.cantidad,
        precioUnitario: det.precioUnitario,
        subTotal: det.subTotal
      })
    )
  )

  return {
    success: true,
    message: 'Pedido generado exitosamente.',
    data: {
      order,
      details: createdDetails
    }
  }
})
