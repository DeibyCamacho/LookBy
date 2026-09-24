import mongoose from 'mongoose'
import dns from 'node:dns'
import { seedDatabase } from '../lib/seeder'

// Forzar DNS globales (Google) para evitar problemas de resolución SRV en Atlas
dns.setServers(['8.8.8.8', '8.8.4.4'])

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('[seed] Falta MONGODB_URI. Asegúrate de que existe .env.local (ver COMO-LEVANTAR-EN-OTRA-PC.md).')
    process.exit(1)
  }

  console.log('[seed] Conectando a MongoDB...')
  await mongoose.connect(uri)

  console.log('[seed] Sembrando datos de ejemplo...')
  await seedDatabase()

  await mongoose.disconnect()
  console.log('[seed] Listo: roles, usuarios de prueba, locales, catálogos, productos, proveedores y reseñas.')
  console.log('[seed] Usuarios: admin@lookby.com/admin123 · profesional@lookby.com/prof123 · proveedor@lookby.com/prov123')
}

main().catch((error) => {
  console.error('[seed] Error:', error)
  process.exit(1)
})