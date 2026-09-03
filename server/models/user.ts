import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  nombre: string
  name?: string // Alias de compatibilidad
  documento?: string
  correo: string
  email?: string // Alias de compatibilidad
  direccion?: string
  ubicacionGPS?: string
  contrasena: string
  password?: string // Alias de compatibilidad
  telefono?: string
  phone?: string // Alias de compatibilidad
  tipoUsuario: 'cliente' | 'profesional' | 'proveedor' | 'admin' | string
  role?: 'cliente' | 'profesional' | 'proveedor' | 'admin' | string // Alias de compatibilidad
  businessName?: string
  specialty?: string
  resetPasswordToken?: string
  resetPasswordExpires?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    documento: {
      type: String,
      default: '',
      trim: true
    },
    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    direccion: {
      type: String,
      default: '',
      trim: true
    },
    ubicacionGPS: {
      type: String,
      default: '',
      trim: true
    },
    contrasena: {
      type: String,
      required: true
    },
    telefono: {
      type: String,
      default: '',
      trim: true
    },
    tipoUsuario: {
      type: String,
      enum: ['cliente', 'profesional', 'proveedor', 'admin', 'staff', 'receptionist'],
      default: 'cliente'
    },
    businessName: {
      type: String,
      default: '',
      trim: true
    },
    specialty: {
      type: String,
      default: '',
      trim: true
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

// Virtuals y transformaciones para compatibilidad
UserSchema.virtual('name').get(function () {
  return this.nombre
})
UserSchema.virtual('email').get(function () {
  return this.correo
})
UserSchema.virtual('role').get(function () {
  return this.tipoUsuario
})
UserSchema.virtual('phone').get(function () {
  return this.telefono
})

UserSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: any) {
    ret.name = ret.nombre
    ret.email = ret.correo
    ret.role = ret.tipoUsuario
    ret.phone = ret.telefono
    delete ret.contrasena
    delete ret.password
    delete ret.resetPasswordToken
    delete ret.resetPasswordExpires
    delete ret.__v
    return ret
  }
})

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
