import { User } from '../models/user'
import { Role } from '../models/role'
import { UserRole } from '../models/userRole'
import { BeautySalon } from '../models/beautySalon'
import { Catalog } from '../models/catalog'
import { Product } from '../models/product'
import { CatalogProductDetail } from '../models/catalogProductDetail'
import { Supplier } from '../models/supplier'
import { SupplierProductDetail } from '../models/supplierProductDetail'
import { Review } from '../models/review'
import { hashPassword } from './auth'

export async function seedDatabase(): Promise<void> {
  try {
    // 1. Sembrar Roles del Sistema
    const rolesData = [
      { nombre: 'admin', descripcion: 'Superadministrador de la plataforma LookBy' },
      { nombre: 'profesional', descripcion: 'Dueño o estilista de Local de Belleza' },
      { nombre: 'proveedor', descripcion: 'Distribuidor y proveedor mayorista de productos' },
      { nombre: 'cliente', descripcion: 'Usuario cliente de servicios y productos' }
    ]

    const rolesMap: Record<string, any> = {}
    for (const r of rolesData) {
      let roleDoc = await Role.findOne({ nombre: r.nombre })
      if (!roleDoc) {
        roleDoc = await Role.create(r)
      }
      rolesMap[r.nombre] = roleDoc
    }

    // 2. Sembrar Usuario Superadministrador
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lookby.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    let adminUser = await User.findOne({ correo: adminEmail.toLowerCase() })

    if (!adminUser) {
      const hashedPassword = await hashPassword(adminPassword)
      adminUser = await User.create({
        nombre: 'Administrador LookBy',
        documento: '1000000001',
        correo: adminEmail.toLowerCase(),
        direccion: 'Av. Principal #10-20, Bogotá',
        ubicacionGPS: '4.60971,-74.08175',
        contrasena: hashedPassword,
        telefono: '3001234567',
        tipoUsuario: 'admin',
        businessName: 'LookBy Platform Central'
      })
      console.log(`✓ Superadministrador inicial verificado: ${adminEmail}`)
    }

    if (adminUser && rolesMap['admin']) {
      const existingUR = await UserRole.findOne({ idUsuario: adminUser._id, idRol: rolesMap['admin']._id })
      if (!existingUR) {
        await UserRole.create({
          idUsuario: adminUser._id,
          idRol: rolesMap['admin']._id,
          descripcion: 'Acceso total de administración'
        })
      }
    }

    // 3. Sembrar Usuario Profesional / Dueño de Local
    const profEmail = 'profesional@lookby.com'
    let profUser = await User.findOne({ correo: profEmail })
    if (!profUser) {
      const hashedPassword = await hashPassword('prof123')
      profUser = await User.create({
        nombre: 'Valeria Gómez',
        documento: '1000000002',
        correo: profEmail,
        direccion: 'Calle 85 #15-32, Zona Rosa',
        ubicacionGPS: '4.6687,-74.0538',
        contrasena: hashedPassword,
        telefono: '3109876543',
        tipoUsuario: 'profesional',
        businessName: 'LookBy Studio & Spa',
        specialty: 'Estilismo & Colorimetría'
      })
      if (rolesMap['profesional']) {
        await UserRole.create({
          idUsuario: profUser._id,
          idRol: rolesMap['profesional']._id,
          descripcion: 'Gestor de salón de belleza'
        })
      }
    }

    // 4. Sembrar Usuario Proveedor
    const provEmail = 'proveedor@lookby.com'
    let provUser = await User.findOne({ correo: provEmail })
    if (!provUser) {
      const hashedPassword = await hashPassword('prov123')
      provUser = await User.create({
        nombre: 'Cosméticos ProHair Distribuciones',
        documento: '900123456-1',
        correo: provEmail,
        direccion: 'Cra 68D #12-40, Parque Industrial',
        ubicacionGPS: '4.6401,-74.1122',
        contrasena: hashedPassword,
        telefono: '3155554433',
        tipoUsuario: 'proveedor',
        businessName: 'ProHair Global S.A.S.'
      })
      if (rolesMap['proveedor']) {
        await UserRole.create({
          idUsuario: provUser._id,
          idRol: rolesMap['proveedor']._id,
          descripcion: 'Proveedor de suministros al por mayor'
        })
      }
    }

    // 5. Sembrar Locales de Belleza (LOCAL_BELLEZA)
    let salon1 = await BeautySalon.findOne({ nombreLocal: 'LookBy Studio & Spa Deluxe' })
    if (!salon1) {
      salon1 = await BeautySalon.create({
        nombreLocal: 'LookBy Studio & Spa Deluxe',
        horario: 'Lunes a Sábado: 8:00 AM - 8:00 PM | Domingo: 9:00 AM - 5:00 PM',
        calificacionPromedio: 4.9,
        totalCalificaciones: 18,
        ownerId: profUser?._id,
        direccion: 'Calle 85 #15-32, Zona Rosa, Bogotá',
        telefono: '3109876543',
        imagen: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        descripcion: 'Centro especializado en alta peluquería, colorimetría avanzada, spa facial y estética integral.'
      })
    }

    let salon2 = await BeautySalon.findOne({ nombreLocal: 'Barbería Urbana LookBy' })
    if (!salon2) {
      salon2 = await BeautySalon.create({
        nombreLocal: 'Barbería Urbana LookBy',
        horario: 'Lunes a Domingo: 9:00 AM - 9:00 PM',
        calificacionPromedio: 4.8,
        totalCalificaciones: 12,
        ownerId: profUser?._id,
        direccion: 'Cra 15 #104-20, Chicó Norte, Bogotá',
        telefono: '3123456789',
        imagen: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
        descripcion: 'Cortes clásicos y modernos, perfilado de barba con toalla caliente y cuidado masculino.'
      })
    }

    // 6. Sembrar Catálogos (CATALOGO)
    let catServicios = await Catalog.findOne({ idLocal: salon1._id, tipoCatalogo: 'Servicios de Belleza' })
    if (!catServicios) {
      catServicios = await Catalog.create({
        idLocal: salon1._id,
        tipoCatalogo: 'Servicios de Belleza',
        descripcion: 'Cortes, peinados, balayage y tratamientos de salón'
      })
    }

    let catProductos = await Catalog.findOne({ idLocal: salon1._id, tipoCatalogo: 'Productos Capilares' })
    if (!catProductos) {
      catProductos = await Catalog.create({
        idLocal: salon1._id,
        tipoCatalogo: 'Productos Capilares',
        descripcion: 'Shampoos, aceites de argán y mascarillas profesionales'
      })
    }

    // 7. Sembrar Maestro de Productos (PRODUCTO)
    const initialProducts = [
      {
        nombre: 'Corte de Cabello & Styling Signature',
        descripcion: 'Asesoría de imagen personalizada, lavado relajante con masaje capilar y peinado profesional.',
        precio: 45000,
        imagen: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=600&q=80',
        categoria: 'Servicios'
      },
      {
        nombre: 'Balayage & Colorimetría Premium',
        descripcion: 'Decoloración cuidada con plex protector, matización personalizada e hidratación profunda.',
        precio: 180000,
        imagen: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        categoria: 'Servicios'
      },
      {
        nombre: 'Keratina Orgánica Brillo Espejo',
        descripcion: 'Alisado termoactivo progresivo sin formol, restaura la fibra capilar y elimina el frizz.',
        precio: 150000,
        imagen: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
        categoria: 'Servicios'
      },
      {
        nombre: 'Shampoo Profesional Argán & Keratina 500ml',
        descripcion: 'Fórmula sin sal rica en nutrientes naturales para mantener el color y brillo del cabello.',
        precio: 55000,
        imagen: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
        categoria: 'Productos'
      },
      {
        nombre: 'Óleo Reparador de Puntas de Macadamia 100ml',
        descripcion: 'Tratamiento sellador térmico de puntas abiertas con filtro UV y extractos botánicos.',
        precio: 42000,
        imagen: 'https://images.unsplash.com/photo-1608248597359-00f722cbfa34?auto=format&fit=crop&w=600&q=80',
        categoria: 'Productos'
      }
    ]

    const productsMap: Record<string, any> = {}
    for (const p of initialProducts) {
      let prodDoc = await Product.findOne({ nombre: p.nombre })
      if (!prodDoc) {
        prodDoc = await Product.create(p)
      }
      productsMap[p.nombre] = prodDoc
    }

    // 8. Sembrar Detalle de Producto en Catálogo (DET_PROD_CAT)
    for (const pName of Object.keys(productsMap)) {
      const prod = productsMap[pName]
      const targetCat = prod.categoria === 'Servicios' ? catServicios : catProductos
      if (targetCat) {
        const existingDetail = await CatalogProductDetail.findOne({
          idCatalogo: targetCat._id,
          idProducto: prod._id
        })
        if (!existingDetail) {
          await CatalogProductDetail.create({
            idCatalogo: targetCat._id,
            idProducto: prod._id,
            stockDisponible: prod.categoria === 'Servicios' ? 99 : 25,
            precioLocal: prod.precio,
            disponibilidad: true
          })
        }
      }
    }

    // 9. Sembrar Proveedor (PROVEEDOR) & Detalle de Producto Proveedor (DET_PROD_PROV)
    let supplierDoc = await Supplier.findOne({ razonSocial: 'ProHair Distribuciones Mayoristas S.A.S.' })
    if (!supplierDoc) {
      supplierDoc = await Supplier.create({
        razonSocial: 'ProHair Distribuciones Mayoristas S.A.S.',
        contacto: 'ventas@prohair.com - (+57) 315 555 4433',
        userId: provUser?._id,
        direccion: 'Parque Industrial Álamos, Bodega 4',
        nit: '900.123.456-7'
      })
    }

    if (supplierDoc) {
      for (const pName of ['Shampoo Profesional Argán & Keratina 500ml', 'Óleo Reparador de Puntas de Macadamia 100ml']) {
        const prod = productsMap[pName]
        if (prod) {
          const existingProvDet = await SupplierProductDetail.findOne({
            idProveedor: supplierDoc._id,
            idProducto: prod._id
          })
          if (!existingProvDet) {
            await SupplierProductDetail.create({
              idProveedor: supplierDoc._id,
              idProducto: prod._id,
              precioMayoreo: Math.round(prod.precio * 0.6), // 40% descuento mayoreo
              stockProveedor: 500,
              tiempoEntrega: '24 a 48 horas'
            })
          }
        }
      }
    }

    // 10. Sembrar Calificación Inicial (CALIFICACION)
    if (salon1 && adminUser) {
      const existingReview = await Review.findOne({ idLocal: salon1._id, idUsuario: adminUser._id })
      if (!existingReview) {
        await Review.create({
          idLocal: salon1._id,
          idUsuario: adminUser._id,
          comentario: '¡Excelente atención y profesionales muy calificados! El balayage me quedó impecable.',
          puntuacion: 5,
          fecha: new Date()
        })
      }
    }

    console.log('✓ Ecosistema de datos conforme al DER sembrado exitosamente.')
  } catch (error) {
    console.error('Error al sembrar datos del DER:', error)
  }
}
