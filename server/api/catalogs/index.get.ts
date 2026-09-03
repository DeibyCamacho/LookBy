import { Catalog } from '../../models/catalog'
import { CatalogProductDetail } from '../../models/catalogProductDetail'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const localId = String(query.localId || '').trim()

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

  return {
    success: true,
    data: result
  }
})
