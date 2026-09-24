import { NextResponse, type NextRequest } from 'next/server'
import { Catalog } from '@/lib/models/catalog'
import { CatalogProductDetail } from '@/lib/models/catalogProductDetail'
import { BeautySalon } from '@/lib/models/beautySalon'
import { getAuthenticatedUser } from '@/lib/auth'
import { connectDB } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
  await connectDB()

  const localId = String(request.nextUrl.searchParams.get('localId') || '').trim()

  const filter: any = {}
  if (localId) {
    filter.idLocal = localId
  }

  const catalogs = await Catalog.find(filter).populate('idLocal')

  const result = await Promise.all(
    catalogs.map(async (cat) => {
      const itemCount = await CatalogProductDetail.countDocuments({ idCatalogo: cat._id })
      return {
        _id: cat._id,
        idLocal: cat.idLocal,
        tipoCatalogo: cat.tipoCatalogo,
        descripcion: cat.descripcion,
        itemCount,
        createdAt: cat.createdAt
      }
    })
  )

  return NextResponse.json({
    success: true,
    data: result
  })
}

export async function POST(request: NextRequest) {
  await connectDB()
  const user = await getAuthenticatedUser(request)
  if (!user) return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const idLocal = String(body?.idLocal || '').trim()
  const tipoCatalogo = String(body?.tipoCatalogo || '').trim()
  const descripcion = String(body?.descripcion || '').trim()

  if (!idLocal || !tipoCatalogo) {
    return NextResponse.json(
      { success: false, message: 'El ID del local y el tipo de catálogo son obligatorios.' },
      { status: 400 }
    )
  }

  const salon = await BeautySalon.findById(idLocal)
  if (!salon) {
    return NextResponse.json(
      { success: false, message: 'Local de belleza no encontrado.' },
      { status: 404 }
    )
  }

  const newCatalog = await Catalog.create({
    idLocal: salon._id,
    tipoCatalogo,
    descripcion
  })

  return NextResponse.json({
    success: true,
    message: 'Catálogo creado exitosamente.',
    data: newCatalog
  })
}