import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRole extends Document {
  _id: mongoose.Types.ObjectId
  nombre: string
  descripcion: string
  createdAt: Date
  updatedAt: Date
}

const RoleSchema = new Schema<IRole>(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
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

export const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema)
