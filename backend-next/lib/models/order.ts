import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId
  idUsuario: mongoose.Types.ObjectId
  idLocal?: mongoose.Types.ObjectId
  fecha: Date
  estado: 'Pendiente' | 'En Preparación' | 'Completado' | 'Cancelado' | string
  montoTotal: number
  direccionEntrega?: string
  notas?: string
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>(
  {
    idUsuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    idLocal: {
      type: Schema.Types.ObjectId,
      ref: 'BeautySalon',
      default: null
    },
    fecha: {
      type: Date,
      default: Date.now
    },
    estado: {
      type: String,
      enum: ['Pendiente', 'En Preparación', 'Completado', 'Cancelado'],
      default: 'Pendiente'
    },
    montoTotal: {
      type: Number,
      required: true,
      min: 0
    },
    direccionEntrega: {
      type: String,
      default: ''
    },
    notas: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)
