import { Order } from '../../models/order'
import { OrderDetail } from '../../models/orderDetail'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const query = getQuery(event)
  const userOnly = query.myOrders === 'true' || user.tipoUsuario === 'cliente'
  const localId = String(query.localId || '').trim()

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

  return {
    success: true,
    data: populatedOrders
  }
})
