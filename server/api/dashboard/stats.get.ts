import { Appointment } from '../../models/appointment'
import { Client } from '../../models/client'
import { Inventory } from '../../models/inventory'
import { requireAuth } from '../../utils/guard'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const now = new Date()

  // Inicio y fin del día actual
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

  // Inicio y fin del mes actual
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  // Consultas paralelas a MongoDB para máximo rendimiento
  const [
    totalClients,
    appointmentsMonth,
    appointmentsToday,
    completedAppointmentsMonth,
    lowStockCount,
    recentAppointments
  ] = await Promise.all([
    Client.countDocuments(),
    Appointment.countDocuments({ dateTime: { $gte: startOfMonth, $lte: endOfMonth } }),
    Appointment.countDocuments({ dateTime: { $gte: startOfDay, $lte: endOfDay } }),
    Appointment.find({
      dateTime: { $gte: startOfMonth, $lte: endOfMonth },
      status: 'completada'
    }).select('price'),
    Inventory.countDocuments({ $expr: { $lte: ['$stock', '$minStock'] } }),
    Appointment.find().sort({ createdAt: -1 }).limit(5)
  ])

  // Sumar ingresos de citas completadas este mes
  const revenueMonth = completedAppointmentsMonth.reduce((acc, curr) => acc + (curr.price || 0), 0)

  return {
    success: true,
    data: {
      stats: {
        totalClients,
        appointmentsMonth,
        appointmentsToday,
        revenueMonth,
        lowStockCount
      },
      recentAppointments
    }
  }
})
