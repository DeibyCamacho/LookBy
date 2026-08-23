import mongoose from 'mongoose'
import dns from 'node:dns'
import { ensureDefaultAdmin } from '../utils/auth'

// Forzar el uso de servidores DNS globales (Google) para evitar problemas de resolución SRV en Atlas
dns.setServers(['8.8.8.8', '8.8.4.4'])

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig()
  const uri = config.mongodbUri || process.env.MONGODB_URI

  if (!uri) {
    console.warn('[LookBy] MONGODB_URI no está configurada en .env o runtimeConfig')
    return
  }

  try {
    await mongoose.connect(uri)
    console.log('[LookBy] Conectado exitosamente a MongoDB')
    await ensureDefaultAdmin()
  } catch (e) {
    console.error('[LookBy] Error al conectar a MongoDB:', e)
  }
})