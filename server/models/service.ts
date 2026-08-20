import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IService extends Document {
  name: string
  description?: string
  price: number
  duration: number // en minutos
  category: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const serviceSchema = new Schema<IService>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del servicio es obligatorio'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    duration: {
      type: Number,
      required: [true, 'La duración en minutos es obligatoria'],
      min: [5, 'La duración mínima es de 5 minutos'],
      default: 30
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

export const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>('Service', serviceSchema)
export default Service
