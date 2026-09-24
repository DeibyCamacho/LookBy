import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  categoria?: string
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    descripcion: {
      type: String,
      default: '',
      trim: true
    },
    precio: {
      type: Number,
      required: true,
      min: 0
    },
    imagen: {
      type: String,
      default: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      trim: true
    },
    categoria: {
      type: String,
      default: 'General',
      trim: true
    }
  },
  {
    timestamps: true
  }
)

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema)
