import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISupplier extends Document {
  _id: mongoose.Types.ObjectId
  razonSocial: string
  contacto: string
  userId?: mongoose.Types.ObjectId
  direccion?: string
  nit?: string
  createdAt: Date
  updatedAt: Date
}

const SupplierSchema = new Schema<ISupplier>(
  {
    razonSocial: {
      type: String,
      required: true,
      trim: true
    },
    contacto: {
      type: String,
      required: true,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    direccion: {
      type: String,
      default: '',
      trim: true
    },
    nit: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
)

export const Supplier: Model<ISupplier> =
  mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema)
