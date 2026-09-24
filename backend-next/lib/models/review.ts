import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId
  idLocal: mongoose.Types.ObjectId
  idUsuario: mongoose.Types.ObjectId
  comentario: string
  puntuacion: number
  fecha: Date
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    idLocal: {
      type: Schema.Types.ObjectId,
      ref: 'BeautySalon',
      required: true
    },
    idUsuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comentario: {
      type: String,
      required: true,
      trim: true
    },
    puntuacion: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    fecha: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
)

export const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema)
