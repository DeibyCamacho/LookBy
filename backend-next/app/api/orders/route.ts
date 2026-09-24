import { NextResponse, type NextRequest } from 'next/server'
import { Order } from '@/lib/models/order'
import { OrderDetail } from '@/lib/models/orderDetail'
import { Product } from '@/lib/models/product'
import { connectDB } from '@/lib/mongodb'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  const query = request.nextUrl.searchParams
  const userOnly = query.get('myOrders') === 'true' || user.tipoUsuario === 'cliente'
  const localId = String(query.get('localId') || '').trim()

  const filter: any = {}

  if (userOnly) {
    filter.idUsuario = user._id
  } else if (localId) {
    filter.idLocal = localId
  }

  const orders = await Order.find(filter)
    .populate('idUsuario', 'nombre correo telefono direccion')
    .populate('idLocal', 'nombreLocal direccion telefono')
    .sort({ fecha: -1 })

  const populatedOrders = await Promise.all(
    orders.map(async (ord) => {
      const details = await OrderDetail.find({ idPedido: ord._id }).populate('idProducto')
      return {
        _id: ord._id,
        idUsuario: ord.idUsuario,
        idLocal: ord.idLocal,
        fecha: ord.fecha,
        estado: ord.estado,
        montoTotal: ord.montoTotal,
        direccionEntrega: ord.direccionEntrega,
        notas: ord.notas,
        detalles: details
      }
    })
  )

  return NextResponse.json({
    success: true,
    data: populatedOrders
  })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  const body = await request.json().catch(() => ({}))

  const idLocal = body?.idLocal || null
  const items = Array.isArray(body?.items) ? body.items : []
  const direccionEntrega = String(body?.direccionEntrega || user.direccion || '').trim()
  const notas = String(body?.notas || '').trim()

  if (!items || items.length === 0) {
    return NextResponse.json({ success: false, message: 'El pedido debe contener al menos un producto.' }, { status: 400 })
  }

  // Validar y calcular montos de cada detalle (DET_PEDIDO)
  let montoTotal = 0
  const validatedDetails = []

  for (const it of items) {
    const productId = it.idProducto || it.productId
    const cantidad = Math.max(1, parseInt(it.cantidad || 1, 10))

    const product = await Product.findById(productId)
    if (!product) {
      return NextResponse.json({ success: false, message: `Producto no encontrado (ID: ${productId}).` }, { status: 404 })
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

  return NextResponse.json({
    success: true,
    message: 'Pedido generado exitosamente.',
    data: {
      order,
      details: createdDetails
    }
  })
}