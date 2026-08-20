import mongoose, { Schema, Document, Model } from 'mongoose'

export type UserRole = 'admin' | 'profesional' | 'proveedor' | 'cliente' | 'staff' | 'receptionist'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  businessName?: string
  specialty?: string
  resetPasswordToken?: string | null
  resetPasswordExpires?: Date | null
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria']
    },
    role: {
      type: String,
      enum: ['admin', 'profesional', 'proveedor', 'cliente', 'staff', 'receptionist'],
      default: 'cliente'
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    businessName: {
      type: String,
      trim: true,
      default: ''
    },
    specialty: {
      type: String,
      trim: true,
      default: ''
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

// Sanitizar objeto para no exponer nunca contraseñas ni tokens
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpires
  delete obj.__v
  return obj
}

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema)
export default User
