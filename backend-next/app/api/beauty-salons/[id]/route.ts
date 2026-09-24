import { NextResponse, type NextRequest } from 'next/server'
import { BeautySalon } from '@/lib/models/beautySalon'
import { Catalog } from '@/lib/models/catalog'
import { CatalogProductDetail } from '@/lib/models/catalogProductDetail'
import { Review } from '@/lib/models/review'
import { connectDB } from '@/lib/mongodb'

export async function GET(request: NextRequest, ctx: { params: Promise<Record<string, string>> }) {
  await connectDB()
  const { id } = await ctx.params

  const salon = await BeautySalon.findById(id)
  if (!salon) {
    return NextResponse.json(
      { success: false, message: 'Local de belleza no encontrado.' },
      { status: 404 }
    )
  }

  // Obtener catálogos del local
  const catalogs = await Catalog.find({ idLocal: salon._id })

  // Para cada catálogo, obtener sus productos asociados (DET_PROD_CAT -> PRODUCTO)
  const catalogsWithProducts = await Promise.all(
    catalogs.map(async (cat) => {
      const items = await CatalogProductDetail.find({ idCatalogo: cat._id }).populate('idProducto')
      return {
        _id: cat._id,
        tipoCatalogo: cat.tipoCatalogo,
        descripcion: cat.descripcion,
        items
      }
    })
  )

  // Obtener calificaciones del local (CALIFICACION)
  const reviews = await Review.find({ idLocal: salon._id }).populate('idUsuario', 'nombre correo').sort({ fecha: -1 })

  return NextResponse.json({
    success: true,
    data: {
      salon,
      catalogs: catalogsWithProducts,
      reviews
    }
  })
}