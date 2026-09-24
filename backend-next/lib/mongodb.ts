import mongoose from 'mongoose'
import dns from 'node:dns'
import { seedDatabase } from './seeder'

// Forzar DNS globales (Google) para evitar problemas de resolución SRV en Atlas
dns.setServers(['8.8.8.8', '8.8.4.4'])

const MONGODB_URI = process.env.MONGODB_URI

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
  seeded: boolean
}

declare global {
  // eslint-disable-next-line no-var
  var _lookbyMongooseCache: MongooseCache | undefined
}

const cached: MongooseCache =
  global._lookbyMongooseCache ?? { conn: null, promise: null, seeded: false }
global._lookbyMongooseCache = cached

/**
 * Conexión única (singleton) a MongoDB reutilizada entre invocaciones.
 * En desarrollo Next recarga los módulos, por eso se cachea en `global`.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error('[LookBy] MONGODB_URI no está configurada en .env.local')
  }

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI)
  }

  try {
    cached.conn = await cached.promise
    console.log('[LookBy] Conectado exitosamente a MongoDB')
  } catch (error) {
    cached.promise = null
    console.error('[LookBy] Error al conectar a MongoDB:', error)
    throw error
  }

  if (!cached.seeded) {
    cached.seeded = true
    try {
      await seedDatabase()
    } catch (error) {
      console.error('[LookBy] Error al sembrar datos:', error)
    }
  }

  return cached.conn
}
