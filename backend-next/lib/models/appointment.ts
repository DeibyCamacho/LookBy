import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IAppointment extends Document {
  clientId?: Types.ObjectId
  serviceId?: Types.ObjectId
  staffId?: Types.ObjectId
  clientName: string
  clientPhone: string
  serviceName: string
  price: number
  dateTime: Date
  duration: number // en minutos
  status: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const appointmentSchema = new Schema<IAppointment>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client'
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service'
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    clientName: {
      type: String,
      required: [true, 'El nombre del cliente es obligatorio'],
      trim: true
    },
    clientPhone: {
      type: String,
      required: [true, 'El teléfono del cliente es obligatorio'],
      trim: true
    },
    serviceName: {
      type: String,
      required: [true, 'El nombre del servicio es obligatorio'],
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    dateTime: {
      type: Date,
      required: [true, 'La fecha y hora de la cita son obligatorias']
    },
    duration: {
      type: Number,
      default: 30,
      min: 5
    },
    status: {
      type: String,
      enum: ['pendiente', 'confirmada', 'completada', 'cancelada'],
      default: 'pendiente'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', appointmentSchema)
export default Appointment
