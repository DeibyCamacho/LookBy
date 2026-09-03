import { BeautySalon } from '../../models/beautySalon'
import { Catalog } from '../../models/catalog'
import { CatalogProductDetail } from '../../models/catalogProductDetail'
import { Review } from '../../models/review'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const salon = await BeautySalon.findById(id)
  if (!salon) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Local de belleza no encontrado.'
    })
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

  return {
    success: true,
    data: {
      salon,
      catalogs: catalogsWithProducts,
      reviews
    }
  }
})
