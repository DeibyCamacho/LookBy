import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUserRole extends Document {
  _id: mongoose.Types.ObjectId
  idUsuario: mongoose.Types.ObjectId
  idRol: mongoose.Types.ObjectId
  descripcion: string
  createdAt: Date
  updatedAt: Date
}

const UserRoleSchema = new Schema<IUserRole>(
  {
    idUsuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    idRol: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true
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

UserRoleSchema.index({ idUsuario: 1, idRol: 1 }, { unique: true })

export const UserRole: Model<IUserRole> =
  mongoose.models.UserRole || mongoose.model<IUserRole>('UserRole', UserRoleSchema)
