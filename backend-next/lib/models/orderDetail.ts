import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOrderDetail extends Document {
  _id: mongoose.Types.ObjectId
  idPedido: mongoose.Types.ObjectId
  idProducto: mongoose.Types.ObjectId
  cantidad: number
  precioUnitario: number
  subTotal: number
  createdAt: Date
  updatedAt: Date
}

const OrderDetailSchema = new Schema<IOrderDetail>(
  {
    idPedido: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    idProducto: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0
    },
    subTotal: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true
  }
)

export const OrderDetail: Model<IOrderDetail> =
  mongoose.models.OrderDetail || mongoose.model<IOrderDetail>('OrderDetail', OrderDetailSchema)
