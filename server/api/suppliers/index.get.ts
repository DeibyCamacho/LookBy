import { Supplier } from '../../models/supplier'
import { SupplierProductDetail } from '../../models/supplierProductDetail'
import { seedDatabase } from '../../utils/seeder'

export default defineEventHandler(async (event) => {
  await seedDatabase()

  const suppliers = await Supplier.find().sort({ razonSocial: 1 })

  const suppliersWithProducts = await Promise.all(
    suppliers.map(async (supp) => {
      const items = await SupplierProductDetail.find({ idProveedor: supp._id }).populate('idProducto')
      return {
        _id: supp._id,
        razonSocial: supp.razonSocial,
        contacto: supp.contacto,
        direccion: supp.direccion,
        nit: supp.nit,
        productosOfrecidos: items
      }
    })
  )

  return {
    success: true,
    data: suppliersWithProducts
  }
})
