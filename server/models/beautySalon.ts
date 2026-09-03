import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBeautySalon extends Document {
  _id: mongoose.Types.ObjectId
  nombreLocal: string
  horario: string
  calificacionPromedio: number
  totalCalificaciones: number
  ownerId?: mongoose.Types.ObjectId
  direccion?: string
  telefono?: string
  imagen?: string
  descripcion?: string
  createdAt: Date
  updatedAt: Date
}

const BeautySalonSchema = new Schema<IBeautySalon>(
  {
    nombreLocal: {
      type: String,
      required: true,
      trim: true
    },
    horario: {
      type: String,
      default: 'Lunes a Sábado: 8:00 AM - 7:00 PM',
      trim: true
    },
    calificacionPromedio: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    totalCalificaciones: {
      type: Number,
      default: 0
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    direccion: {
      type: String,
      default: '',
      trim: true
    },
    telefono: {
      type: String,
      default: '',
      trim: true
    },
    imagen: {
      type: String,
      default: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      trim: true
    },
    descripcion: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
)

export const BeautySalon: Model<IBeautySalon> =
  mongoose.models.BeautySalon || mongoose.model<IBeautySalon>('BeautySalon', BeautySalonSchema)
