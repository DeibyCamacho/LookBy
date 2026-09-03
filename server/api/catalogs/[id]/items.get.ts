import { CatalogProductDetail } from '../../../models/catalogProductDetail'

export default defineEventHandler(async (event) => {
  const catalogId = getRouterParam(event, 'id')

  const items = await CatalogProductDetail.find({ idCatalogo: catalogId }).populate('idProducto')

  return {
    success: true,
    data: items
  }
})
