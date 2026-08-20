import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IClient extends Document {
  name: string
  phone: string
  email?: string
  notes?: string
  totalVisits: number
  createdAt: Date
  updatedAt: Date
}

const clientSchema = new Schema<IClient>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del cliente es obligatorio'],
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'El teléfono del cliente es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    totalVisits: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
)

export const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>('Client', clientSchema)
export default Client
