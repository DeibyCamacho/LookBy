import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISupplierProductDetail extends Document {
  _id: mongoose.Types.ObjectId
  idProveedor: mongoose.Types.ObjectId
  idProducto: mongoose.Types.ObjectId
  precioMayoreo: number
  stockProveedor: number
  tiempoEntrega: string
  createdAt: Date
  updatedAt: Date
}

const SupplierProductDetailSchema = new Schema<ISupplierProductDetail>(
  {
    idProveedor: {
      type: Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true
    },
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    precioMayoreo: {
      type: Number,
      required: true,
      min: 0
    },
    stockProveedor: {
      type: Number,
      required: true,
      min: 0
    },
    tiempoEntrega: {
      type: String,
      default: '24 a 48 horas',
      trim: true
    }
  },
  {
    timestamps: true
  }
)

SupplierProductDetailSchema.index({ idProveedor: 1, idProducto: 1 }, { unique: true })

export const SupplierProductDetail: Model<ISupplierProductDetail> =
  mongoose.models.SupplierProductDetail ||
  mongoose.model<ISupplierProductDetail>('SupplierProductDetail', SupplierProductDetailSchema)
