import { NextResponse, type NextRequest } from 'next/server'
import { Supplier } from '@/lib/models/supplier'
import { SupplierProductDetail } from '@/lib/models/supplierProductDetail'
import { connectDB } from '@/lib/mongodb'
import { seedDatabase } from '@/lib/seeder'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  await connectDB()
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

  return NextResponse.json({
    success: true,
    data: suppliersWithProducts
  })
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })
  }
  await connectDB()
  const body = await request.json().catch(() => ({}))

  const razonSocial = String(body?.razonSocial || '').trim()
  const contacto = String(body?.contacto || '').trim()
  const direccion = String(body?.direccion || '').trim()
  const nit = String(body?.nit || '').trim()

  if (!razonSocial || !contacto) {
    return NextResponse.json({ success: false, message: 'La razón social y el contacto del proveedor son obligatorios.' }, { status: 400 })
  }

  const supplier = await Supplier.create({
    razonSocial,
    contacto,
    direccion,
    nit,
    userId: user._id
  })

  return NextResponse.json({
    success: true,
    message: 'Perfil de proveedor registrado exitosamente.',
    data: supplier
  })
}