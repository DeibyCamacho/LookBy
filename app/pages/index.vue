<template>
  <div class="landing-shell">
    <!-- Navbar Superior -->
    <header class="public-navbar">
      <div class="navbar-container">
        <NuxtLink to="/" class="brand-logo">
          <span class="logo-emoji">🌸</span>
          <span class="logo-text">LookBy</span>
        </NuxtLink>

        <nav class="nav-links">
          <a href="#locales" class="nav-link">Locales de Belleza</a>
          <a href="#catalogo" class="nav-link">Catálogo & Productos</a>
          <a href="#proveedores" class="nav-link">Proveedores</a>
          <a href="#como-funciona" class="nav-link">¿Cómo Funciona?</a>
        </nav>

        <div class="nav-actions">
          <ThemeToggle />
          <button v-if="cartItems.length > 0" class="btn-cart" @click="showCartModal = true">
            🛒 Carrito <span class="cart-badge">{{ cartItems.length }}</span>
          </button>
          <NuxtLink v-if="!isLoggedIn" to="/admin/login" class="btn-secondary nav-btn">Iniciar Sesión</NuxtLink>
          <NuxtLink v-if="!isLoggedIn" to="/admin/registro" class="btn-secondary nav-btn">Registrarse</NuxtLink>
          <NuxtLink v-else :to="roleHome" class="btn-secondary nav-btn">{{ roleButtonLabel }}</NuxtLink>
          <NuxtLink to="/reservar" class="btn-primary nav-btn">Reservar Cita</NuxtLink>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <span class="hero-pill">✨ Ecosistema integral de belleza, salones y productos</span>
        <h1>Conecta con los mejores locales de belleza y productos premium</h1>
        <p>
          En LookBy encuentras los salones de belleza mejor calificados, exploras sus catálogos exclusivos
          y realizas pedidos o reservas en tiempo real con total seguridad.
        </p>

        <div class="hero-cta-group">
          <NuxtLink to="/reservar" class="btn-primary hero-btn">
            <span>📅 Agendar Cita Online</span>
          </NuxtLink>
          <a href="#locales" class="btn-secondary hero-btn">
            <span>Explorar Locales & Catálogos ↓</span>
          </a>
        </div>

        <div class="hero-features">
          <div class="feature-badge">
            <span>⭐</span>
            <small>Locales Calificados</small>
          </div>
          <div class="feature-badge">
            <span>🧴</span>
            <small>Catálogos & Productos</small>
          </div>
          <div class="feature-badge">
            <span>📦</span>
            <small>Red de Proveedores</small>
          </div>
        </div>
      </div>
    </section>

    <!-- Sección 1: Locales de Belleza (LOCAL_BELLEZA) -->
    <section id="locales" class="section-container">
      <div class="section-header">
        <span class="section-tag">Centros & Salones</span>
        <h2>Locales de Belleza Destacados</h2>
        <p>Descubre los salones y barberías mejor valorados por nuestra comunidad de clientes.</p>
      </div>

      <div v-if="pendingSalons" class="loading-state">
        <p>Cargando locales de belleza...</p>
      </div>

      <div v-else class="salons-grid">
        <article v-for="salon in salons" :key="salon._id" class="salon-card">
          <div class="salon-image-box">
            <img :src="salon.imagen || defaultSalonImg" :alt="salon.nombreLocal" class="salon-img" />
            <div class="rating-badge">
              <span>⭐ {{ salon.calificacionPromedio ? salon.calificacionPromedio.toFixed(1) : '5.0' }}</span>
              <small>({{ salon.totalCalificaciones || 1 }} reseñas)</small>
            </div>
          </div>

          <div class="salon-body">
            <h3>{{ salon.nombreLocal }}</h3>
            <p class="salon-desc">{{ salon.descripcion || 'Servicios profesionales de estética y peluquería.' }}</p>

            <div class="salon-meta-item">
              <span class="meta-icon">📍</span>
              <small>{{ salon.direccion || 'Bogotá, Colombia' }}</small>
            </div>
            <div class="salon-meta-item">
              <span class="meta-icon">🕒</span>
              <small>{{ salon.horario || 'Lunes a Sábado: 8:00 AM - 7:00 PM' }}</small>
            </div>

            <div class="salon-actions">
              <button class="btn-secondary btn-sm" @click="openSalonModal(salon)">
                👁️ Ver Catálogo & Reseñas
              </button>
              <button class="btn-primary btn-sm" @click="openReviewModal(salon)">
                ⭐ Calificar
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Sección 2: Catálogo de Productos y Servicios (PRODUCTO & DET_PROD_CAT) -->
    <section id="catalogo" class="section-container bg-alt">
      <div class="section-header">
        <span class="section-tag">Catálogo Maestro</span>
        <h2>Productos y Tratamientos Disponibles</h2>
        <p>Adquiere productos capilares o agenda tratamientos directamente con los salones.</p>
      </div>

      <!-- Filtro por Categoría -->
      <div class="category-filters">
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['filter-pill', { active: activeCategory === cat }]"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div v-if="pendingProducts" class="loading-state">
        <p>Cargando catálogo de productos...</p>
      </div>

      <div v-else class="products-grid">
        <article v-for="product in filteredProducts" :key="product._id" class="product-card">
          <div class="product-image-box">
            <img :src="product.imagen || defaultProdImg" :alt="product.nombre" class="product-img" />
            <span class="category-badge">{{ product.categoria || 'General' }}</span>
          </div>

          <div class="product-body">
            <h4>{{ product.nombre }}</h4>
            <p class="product-desc">{{ product.descripcion }}</p>

            <div class="product-footer">
              <div class="price-box">
                <span class="price-label">Precio</span>
                <strong class="price-value">${{ formatPrice(product.precio) }}</strong>
              </div>

              <button class="btn-primary btn-sm" @click="addToCart(product)">
                🛒 Añadir al Pedido
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Sección 3: Proveedores de la Plataforma (PROVEEDOR & DET_PROD_PROV) -->
    <section id="proveedores" class="section-container">
      <div class="section-header">
        <span class="section-tag">Red Mayorista</span>
        <h2>Proveedores y Distribuidores de Belleza</h2>
        <p>Conectamos a los salones con proveedores directos de insumos al por mayor.</p>
      </div>

      <div v-if="pendingSuppliers" class="loading-state">
        <p>Cargando proveedores...</p>
      </div>

      <div v-else class="suppliers-grid">
        <article v-for="supplier in suppliers" :key="supplier._id" class="supplier-card">
          <div class="supplier-header">
            <span class="supplier-icon">🏢</span>
            <div>
              <h3>{{ supplier.razonSocial }}</h3>
              <small>{{ supplier.contacto }}</small>
            </div>
          </div>

          <p class="supplier-address">📍 {{ supplier.direccion || 'Parque Industrial Álamos, Bodega 4' }}</p>

          <div v-if="supplier.productosOfrecidos && supplier.productosOfrecidos.length > 0" class="supplier-items-preview">
            <strong>Ofertas Mayoristas:</strong>
            <ul class="wholesale-list">
              <li v-for="item in supplier.productosOfrecidos.slice(0, 3)" :key="item._id">
                <span>{{ item.idProducto?.nombre || 'Insumo Capilar' }}</span>
                <span class="wholesale-price">${{ formatPrice(item.precioMayoreo) }} (Mayoreo)</span>
              </li>
            </ul>
          </div>
        </article>
      </div>
    </section>

    <!-- Footer -->
    <footer class="public-footer">
      <div class="footer-container">
        <div class="footer-brand">
          <div class="brand-logo">
            <span class="logo-emoji">🌸</span>
            <span class="logo-text">LookBy</span>
          </div>
          <p>Ecosistema digital de gestión, agendamiento y suministros para la industria de la belleza.</p>
        </div>

        <div class="footer-links-group">
          <strong>Navegación</strong>
          <a href="#locales">Locales de Belleza</a>
          <a href="#catalogo">Catálogo</a>
          <a href="#proveedores">Proveedores</a>
          <NuxtLink to="/reservar">Agendar Cita</NuxtLink>
        </div>

        <div class="footer-links-group">
          <strong>Portales</strong>
          <NuxtLink to="/admin/login">Iniciar Sesión</NuxtLink>
          <NuxtLink to="/admin/registro">Registrarse</NuxtLink>
          <NuxtLink to="/admin">Superadmin</NuxtLink>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 LookBy Platform. Todos los derechos reservados.</p>
      </div>
    </footer>

    <!-- Modal Detalle del Local (CATALOGO + CALIFICACION) -->
    <div v-if="selectedSalon" class="modal-overlay" @click.self="selectedSalon = null">
      <div class="modal-box modal-lg">
        <div class="modal-header">
          <div>
            <span class="modal-eyebrow">Local de Belleza</span>
            <h3>{{ selectedSalon.nombreLocal }}</h3>
          </div>
          <button class="btn-close" @click="selectedSalon = null">✕</button>
        </div>

        <div class="salon-detail-content">
          <div class="salon-meta-bar">
            <span>⭐ <strong>{{ selectedSalon.calificacionPromedio?.toFixed(1) || '5.0' }}</strong> de calificación</span>
            <span>📍 {{ selectedSalon.direccion }}</span>
            <span>🕒 {{ selectedSalon.horario }}</span>
          </div>

          <div class="modal-tabs">
            <button :class="['tab-btn', { active: modalTab === 'catalogo' }]" @click="modalTab = 'catalogo'">
              Catálogos y Productos
            </button>
            <button :class="['tab-btn', { active: modalTab === 'reseñas' }]" @click="modalTab = 'reseñas'">
              Reseñas y Calificaciones
            </button>
          </div>

          <!-- Pestaña Catálogos -->
          <div v-if="modalTab === 'catalogo'" class="modal-tab-body">
            <div v-if="loadingSalonDetails" class="loading-state">
              <p>Cargando catálogos del local...</p>
            </div>
            <div v-else-if="!salonCatalogs.length" class="empty-state">
              <p>Este local aún no ha publicado catálogos.</p>
            </div>
            <div v-else class="catalogs-list">
              <div v-for="cat in salonCatalogs" :key="cat._id" class="catalog-group">
                <h4 class="catalog-group-title">📂 {{ cat.tipoCatalogo }}</h4>
                <p class="catalog-group-desc">{{ cat.descripcion }}</p>

                <div class="catalog-items-grid">
                  <div v-for="it in cat.items" :key="it._id" class="catalog-item-card">
                    <img :src="it.idProducto?.imagen || defaultProdImg" :alt="it.idProducto?.nombre" class="item-thumb" />
                    <div class="item-info">
                      <strong>{{ it.idProducto?.nombre }}</strong>
                      <small>{{ it.idProducto?.descripcion }}</small>
                      <div class="item-price-row">
                        <span class="price-highlight">${{ formatPrice(it.precioLocal) }}</span>
                        <span :class="['stock-pill', it.disponibilidad ? 'available' : 'out']">
                          {{ it.disponibilidad ? `Stock: ${it.stockDisponible}` : 'Agotado' }}
                        </span>
                      </div>
                      <button
                        class="btn-secondary btn-xs"
                        :disabled="!it.disponibilidad"
                        @click="addToCart({ _id: it.idProducto?._id, nombre: it.idProducto?.nombre, precio: it.precioLocal, imagen: it.idProducto?.imagen })"
                      >
                        🛒 Añadir al Pedido
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pestaña Reseñas -->
          <div v-if="modalTab === 'reseñas'" class="modal-tab-body">
            <div class="reviews-header-row">
              <h4>Reseñas de Clientes</h4>
              <button class="btn-primary btn-sm" @click="openReviewModal(selectedSalon)">
                ⭐ Escribir Calificación
              </button>
            </div>

            <div v-if="!salonReviews.length" class="empty-state">
              <p>Aún no hay calificaciones para este local. ¡Sé el primero en calificar!</p>
            </div>
            <div v-else class="reviews-list">
              <div v-for="rev in salonReviews" :key="rev._id" class="review-item">
                <div class="review-top">
                  <strong>{{ rev.idUsuario?.nombre || 'Cliente LookBy' }}</strong>
                  <span class="stars-gold">{'⭐'.repeat(rev.puntuacion)}</span>
                </div>
                <p class="review-comment">"{{ rev.comentario }}"</p>
                <small class="review-date">{{ formatDate(rev.fecha) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Calificar Local (CALIFICACION) -->
    <div v-if="salonToReview" class="modal-overlay" @click.self="salonToReview = null">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <span class="modal-eyebrow">Calificar Local</span>
            <h3>{{ salonToReview.nombreLocal }}</h3>
          </div>
          <button class="btn-close" @click="salonToReview = null">✕</button>
        </div>

        <form @submit.prevent="submitReview" class="modal-form">
          <div class="form-group">
            <label>Puntuación (1 a 5 estrellas):</label>
            <div class="star-rating-selector">
              <button
                type="button"
                v-for="star in 5"
                :key="star"
                :class="['star-btn', { active: reviewForm.puntuacion >= star }]"
                @click="reviewForm.puntuacion = star"
              >
                ★
              </button>
              <span class="score-label">{{ reviewForm.puntuacion }} / 5 estrellas</span>
            </div>
          </div>

          <div class="form-group">
            <label>Tu Comentario / Reseña:</label>
            <textarea
              v-model="reviewForm.comentario"
              rows="4"
              class="input-field"
              placeholder="Escribe tu experiencia sobre la atención, puntualidad y calidad de los servicios..."
              required
            ></textarea>
          </div>

          <div v-if="reviewError" class="modal-error">{{ reviewError }}</div>
          <div v-if="reviewSuccess" class="modal-success">{{ reviewSuccess }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="salonToReview = null">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="submittingReview">
              {{ submittingReview ? 'Guardando...' : 'Publicar Calificación' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Carrito & Crear Pedido (PEDIDO & DET_PEDIDO) -->
    <div v-if="showCartModal" class="modal-overlay" @click.self="showCartModal = false">
      <div class="modal-box modal-md">
        <div class="modal-header">
          <div>
            <span class="modal-eyebrow">Confirmación de Compra</span>
            <h3>Tu Pedido de Productos (PEDIDO)</h3>
          </div>
          <button class="btn-close" @click="showCartModal = false">✕</button>
        </div>

        <div v-if="cartItems.length === 0" class="empty-state">
          <p>Tu carrito está vacío.</p>
        </div>

        <div v-else class="cart-content">
          <div class="cart-items-list">
            <div v-for="(item, idx) in cartItems" :key="idx" class="cart-item-row">
              <img :src="item.imagen || defaultProdImg" class="cart-item-img" />
              <div class="cart-item-meta">
                <strong>{{ item.nombre }}</strong>
                <small>${{ formatPrice(item.precio) }} c/u</small>
              </div>
              <div class="cart-qty-control">
                <button class="btn-qty" @click="updateQty(idx, -1)">-</button>
                <span>{{ item.cantidad }}</span>
                <button class="btn-qty" @click="updateQty(idx, 1)">+</button>
              </div>
              <strong class="cart-item-subtotal">${{ formatPrice(item.precio * item.cantidad) }}</strong>
              <button class="btn-remove" @click="removeFromCart(idx)">🗑️</button>
            </div>
          </div>

          <div class="order-summary-box">
            <div class="summary-row">
              <span>Subtotal:</span>
              <strong>${{ formatPrice(cartTotal) }}</strong>
            </div>
            <div class="summary-row total">
              <span>Monto Total (montoTotal):</span>
              <strong>${{ formatPrice(cartTotal) }}</strong>
            </div>
          </div>

          <form @submit.prevent="submitOrder" class="modal-form">
            <div class="form-group">
              <label>Dirección de Entrega:</label>
              <input
                v-model="orderForm.direccionEntrega"
                type="text"
                class="input-field"
                placeholder="Ej. Calle 123 #45-67, Apto 302"
                required
              />
            </div>

            <div class="form-group">
              <label>Notas del Pedido:</label>
              <input
                v-model="orderForm.notas"
                type="text"
                class="input-field"
                placeholder="Instrucciones adicionales para la entrega..."
              />
            </div>

            <div v-if="orderError" class="modal-error">{{ orderError }}</div>
            <div v-if="orderSuccess" class="modal-success">{{ orderSuccess }}</div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="showCartModal = false">Cerrar</button>
              <button type="submit" class="btn-primary" :disabled="submittingOrder">
                {{ submittingOrder ? 'Procesando...' : `Confirmar Pedido ($${formatPrice(cartTotal)})` }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const defaultSalonImg = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'
const defaultProdImg = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'

// Consultar Locales de Belleza (LOCAL_BELLEZA)
const { data: salonsData, pending: pendingSalons } = await useFetch<{ success: boolean; data: any[] }>('/api/beauty-salons')
const salons = computed(() => salonsData.value?.data || [])

// Consultar Productos Maestros (PRODUCTO)
const { data: productsData, pending: pendingProducts } = await useFetch<{ success: boolean; data: any[] }>('/api/products')
const products = computed(() => productsData.value?.data || [])

// Consultar Proveedores (PROVEEDOR & DET_PROD_PROV)
const { data: suppliersData, pending: pendingSuppliers } = await useFetch<{ success: boolean; data: any[] }>('/api/suppliers')
const suppliers = computed(() => suppliersData.value?.data || [])

// Categorías para filtrado
const categories = ['Todos', 'Servicios', 'Productos', 'General']
const activeCategory = ref('Todos')

const filteredProducts = computed(() => {
  if (activeCategory.value === 'Todos') return products.value
  return products.value.filter((p) => p.categoria === activeCategory.value)
})

// Estado de sesión
const isLoggedIn = computed(() => authStore.isAuthenticated)
const roleHome = computed(() => authStore.getRoleHomeRoute(authStore.user?.role))
const roleButtonLabel = computed(() => {
  if (authStore.isAdmin) return '🛡️ Panel Superadmin'
  if (authStore.isProfesional) return '📊 Panel del Salón'
  if (authStore.isProveedor) return '📦 Portal Proveedor'
  return '👤 Mis Citas & Pedidos'
})

// Modal Detalle Local
const selectedSalon = ref<any>(null)
const salonCatalogs = ref<any[]>([])
const salonReviews = ref<any[]>([])
const loadingSalonDetails = ref(false)
const modalTab = ref<'catalogo' | 'reseñas'>('catalogo')

const openSalonModal = async (salon: any) => {
  selectedSalon.value = salon
  modalTab.value = 'catalogo'
  loadingSalonDetails.value = true
  try {
    const res = await $fetch<{ success: boolean; data: { catalogs: any[]; reviews: any[] } }>(`/api/beauty-salons/${salon._id}`)
    salonCatalogs.value = res.data?.catalogs || []
    salonReviews.value = res.data?.reviews || []
  } catch (e) {
    console.error('Error al cargar detalle del local:', e)
  } finally {
    loadingSalonDetails.value = false
  }
}

// Modal Calificación (CALIFICACION)
const salonToReview = ref<any>(null)
const reviewForm = reactive({
  puntuacion: 5,
  comentario: ''
})
const reviewError = ref('')
const reviewSuccess = ref('')
const submittingReview = ref(false)

const openReviewModal = (salon: any) => {
  if (!authStore.isAuthenticated) {
    navigateTo('/admin/login')
    return
  }
  salonToReview.value = salon
  reviewForm.puntuacion = 5
  reviewForm.comentario = ''
  reviewError.value = ''
  reviewSuccess.value = ''
}

const submitReview = async () => {
  if (!salonToReview.value) return
  submittingReview.value = true
  reviewError.value = ''
  reviewSuccess.value = ''

  try {
    const res = await $fetch<{ success: boolean; message: string; data: any }>(
      `/api/beauty-salons/${salonToReview.value._id}/reviews`,
      {
        method: 'POST',
        body: reviewForm
      }
    )
    reviewSuccess.value = res.message || '¡Calificación registrada con éxito!'
    setTimeout(() => {
      salonToReview.value = null
      // refrescar lista si está abierta
      if (selectedSalon.value?._id === salonToReview.value?._id) {
        openSalonModal(selectedSalon.value)
      }
    }, 1200)
  } catch (err: any) {
    reviewError.value = err?.data?.statusMessage || err?.message || 'Error al enviar calificación.'
  } finally {
    submittingReview.value = false
  }
}

// Carrito & Pedidos (PEDIDO & DET_PEDIDO)
const cartItems = ref<any[]>([])
const showCartModal = ref(false)
const orderForm = reactive({
  direccionEntrega: '',
  notas: ''
})
const orderError = ref('')
const orderSuccess = ref('')
const submittingOrder = ref(false)

const addToCart = (product: any) => {
  const existing = cartItems.value.find((it) => it.idProducto === product._id)
  if (existing) {
    existing.cantidad++
  } else {
    cartItems.value.push({
      idProducto: product._id,
      nombre: product.nombre,
      precio: product.precio,
      imagen: product.imagen,
      cantidad: 1
    })
  }
  showCartModal.value = true
}

const updateQty = (index: number, delta: number) => {
  const it = cartItems.value[index]
  if (!it) return
  it.cantidad += delta
  if (it.cantidad <= 0) {
    cartItems.value.splice(index, 1)
  }
}

const removeFromCart = (index: number) => {
  cartItems.value.splice(index, 1)
}

const cartTotal = computed(() => {
  return cartItems.value.reduce((sum, it) => sum + it.precio * it.cantidad, 0)
})

const submitOrder = async () => {
  if (!authStore.isAuthenticated) {
    navigateTo('/admin/login')
    return
  }
  if (cartItems.value.length === 0) return

  submittingOrder.value = true
  orderError.value = ''
  orderSuccess.value = ''

  try {
    const res = await $fetch<{ success: boolean; message: string; data: any }>('/api/orders', {
      method: 'POST',
      body: {
        items: cartItems.value,
        direccionEntrega: orderForm.direccionEntrega,
        notas: orderForm.notas
      }
    })

    orderSuccess.value = '¡Pedido generado exitosamente! Puedes consultarlo en tu portal.'
    cartItems.value = []
    setTimeout(() => {
      showCartModal.value = false
      navigateTo('/cliente')
    }, 1500)
  } catch (err: any) {
    orderError.value = err?.data?.statusMessage || err?.message || 'Error al generar el pedido.'
  } finally {
    submittingOrder.value = false
  }
}

const formatPrice = (val: number) => {
  return (val || 0).toLocaleString('es-CO')
}

const formatDate = (d: string) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.landing-shell {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-body);
}

.public-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  backdrop-filter: blur(8px);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-emoji {
  font-size: 1.8rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-title);
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: var(--text-body);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-cart {
  background: rgba(200, 157, 124, 0.15);
  border: 1px solid var(--primary);
  color: var(--primary-hover);
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.cart-badge {
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
  padding: 2px 7px;
  font-size: 0.75rem;
}

.hero-section {
  padding: 80px 24px 60px;
  text-align: center;
  background: linear-gradient(180deg, var(--bg-card) 0%, var(--bg-main) 100%);
  border-bottom: 1px solid var(--border);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.hero-pill {
  background-color: rgba(200, 157, 124, 0.15);
  color: var(--primary);
  border: 1px solid rgba(200, 157, 124, 0.3);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
}

.hero-content h1 {
  font-size: clamp(2rem, 5vw, 3.2rem);
  color: var(--text-title);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
}

.hero-content p {
  font-size: 1.15rem;
  color: var(--text-body);
  line-height: 1.6;
}

.hero-cta-group {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 10px;
}

.hero-btn {
  padding: 14px 28px;
  font-size: 1rem;
}

.hero-features {
  display: flex;
  gap: 24px;
  margin-top: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.feature-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-card);
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.section-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 70px 24px;
}

.bg-alt {
  background-color: var(--bg-subtle);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-tag {
  color: var(--primary);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.section-header h2 {
  font-size: 2.2rem;
  color: var(--text-title);
  margin: 6px 0;
}

.salons-grid,
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.salon-card,
.product-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.salon-card:hover,
.product-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
}

.salon-image-box,
.product-image-box {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.salon-img,
.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rating-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background-color: rgba(0, 0, 0, 0.75);
  color: #ffc107;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(4px);
}

.category-badge {
  position: absolute;
  top: 14px;
  left: 14px;
  background-color: var(--primary);
  color: #fff;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.salon-body,
.product-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 10px;
}

.salon-desc,
.product-desc {
  font-size: 0.9rem;
  color: var(--text-body);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.salon-meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-body);
}

.salon-actions {
  margin-top: auto;
  display: flex;
  gap: 8px;
  padding-top: 12px;
}

.category-filters {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.filter-pill {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 8px 18px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-body);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-pill.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.product-footer {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.price-value {
  font-size: 1.25rem;
  color: var(--primary-hover);
}

/* Suppliers Grid */
.suppliers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.supplier-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.supplier-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.supplier-icon {
  font-size: 2rem;
}

.wholesale-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wholesale-list li {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding: 6px 10px;
  background: var(--bg-subtle);
  border-radius: 8px;
}

.wholesale-price {
  color: var(--accent);
  font-weight: 700;
}

/* Modal and Cart Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
  box-shadow: var(--shadow);
}

.modal-lg {
  max-width: 850px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.modal-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
}

.modal-tabs {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid var(--border);
  margin: 16px 0;
}

.tab-btn {
  background: transparent;
  border: none;
  padding: 10px 18px;
  font-weight: 700;
  color: var(--text-body);
  border-bottom: 3px solid transparent;
  cursor: pointer;
}

.tab-btn.active {
  color: var(--primary);
  border-color: var(--primary);
}

.catalog-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  margin-top: 10px;
}

.catalog-item-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  gap: 10px;
}

.item-thumb {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.star-rating-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0;
}

.star-btn {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: #ccc;
  cursor: pointer;
}

.star-btn.active {
  color: #ffc107;
}

/* Cart Item Row */
.cart-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}

.cart-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: var(--bg-subtle);
  border-radius: 12px;
}

.cart-item-img {
  width: 45px;
  height: 45px;
  border-radius: 8px;
  object-fit: cover;
}

.cart-qty-control {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-qty {
  background: var(--bg-card);
  border: 1px solid var(--border);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  cursor: pointer;
}

.order-summary-box {
  background: var(--bg-subtle);
  border-radius: 12px;
  padding: 14px;
  margin: 16px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.summary-row.total {
  border-top: 1px solid var(--border);
  padding-top: 8px;
  font-size: 1.1rem;
  color: var(--primary-hover);
}

.public-footer {
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  padding: 60px 24px 24px;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
}

.footer-bottom {
  text-align: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  font-size: 0.85rem;
}

@media (max-width: 800px) {
  .nav-links {
    display: none;
  }
  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>