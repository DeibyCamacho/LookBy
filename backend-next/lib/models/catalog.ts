import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICatalog extends Document {
  _id: mongoose.Types.ObjectId
  idLocal: mongoose.Types.ObjectId
  tipoCatalogo: string
  descripcion: string
  createdAt: Date
  updatedAt: Date
}

const CatalogSchema = new Schema<ICatalog>(
  {
    idLocal: {
      type: Schema.Types.ObjectId,
      ref: 'BeautySalon',
      required: true
    },
    tipoCatalogo: {
      type: String,
      required: true,
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

export const Catalog: Model<ICatalog> =
  mongoose.models.Catalog || mongoose.model<ICatalog>('Catalog', CatalogSchema)
