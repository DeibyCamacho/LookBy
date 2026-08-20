import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IInventory extends Document {
  name: string
  sku?: string
  category: string
  stock: number
  minStock: number
  unit: string
  costPrice: number
  salePrice: number
  createdAt: Date
  updatedAt: Date
}

const inventorySchema = new Schema<IInventory>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true
    },
    sku: {
      type: String,
      trim: true,
      default: ''
    },
    category: {
      type: String,
      trim: true,
      default: 'General'
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo'],
      default: 0
    },
    minStock: {
      type: Number,
      default: 5,
      min: 0
    },
    unit: {
      type: String,
      trim: true,
      default: 'unidades'
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0
    },
    salePrice: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
)

export const Inventory: Model<IInventory> =
  mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', inventorySchema)
export default Inventory
