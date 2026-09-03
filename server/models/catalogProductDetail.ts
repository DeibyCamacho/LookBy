import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICatalogProductDetail extends Document {
  _id: mongoose.Types.ObjectId
  idCatalogo: mongoose.Types.ObjectId
  idProducto: mongoose.Types.ObjectId
  stockDisponible: number
  precioLocal: number
  disponibilidad: boolean
  createdAt: Date
  updatedAt: Date
}

const CatalogProductDetailSchema = new Schema<ICatalogProductDetail>(
  {
    idCatalogo: {
      type: Schema.Types.ObjectId,
      ref: 'Catalog',
      required: true
    },
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    stockDisponible: {
      type: Number,
      default: 10,
      min: 0
    },
    precioLocal: {
      type: Number,
      required: true,
      min: 0
    },
    disponibilidad: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

CatalogProductDetailSchema.index({ idCatalogo: 1, idProducto: 1 }, { unique: true })

export const CatalogProductDetail: Model<ICatalogProductDetail> =
  mongoose.models.CatalogProductDetail ||
  mongoose.model<ICatalogProductDetail>('CatalogProductDetail', CatalogProductDetailSchema)
