<template>
  <div class="supplier-shell">
    <header class="supplier-navbar">
      <div class="navbar-container">
        <NuxtLink to="/proveedor" class="brand-logo">
          <span class="logo-emoji">📦</span>
          <span class="logo-text">LookBy</span>
          <span class="portal-badge">Portal Proveedor (PROVEEDOR)</span>
        </NuxtLink>

        <div class="nav-actions">
          <ThemeToggle />
          <button class="btn-primary nav-btn" @click="showOfferModal = true">+ Publicar Oferta Mayorista (DET_PROD_PROV)</button>
          <button class="btn-secondary nav-btn" @click="showProductModal = true">+ Nuevo Producto Maestro</button>
          <button class="btn-secondary nav-btn logout" @click="handleLogout">🚪 Cerrar Sesión</button>
        </div>
      </div>
    </header>

    <main class="supplier-content">
      <!-- Banner del Proveedor -->
      <section class="supplier-banner">
        <div>
          <span class="eyebrow-tag">Proveedor Mayorista Registrado</span>
          <h2>{{ currentSupplier?.razonSocial || authStore.user?.businessName || 'ProHair Distribuciones Mayoristas S.A.S.' }}</h2>
          <p>📞 Contacto: {{ currentSupplier?.contacto || authStore.user?.email }} | 📍 {{ currentSupplier?.direccion || 'Parque Industrial Álamos' }}</p>
        </div>
        <span class="badge-role">PROVEEDOR</span>
      </section>

      <!-- Selector de Pestañas -->
      <div class="supplier-tabs-nav">
        <button
          :class="['supp-tab-btn', { active: activeTab === 'ofertas' }]"
          @click="activeTab = 'ofertas'"
        >
          🏷️ Ofertas Mayoristas Publicadas (DET_PROD_PROV)
        </button>
        <button
          :class="['supp-tab-btn', { active: activeTab === 'maestro' }]"
          @click="activeTab = 'maestro'"
        >
          🧴 Maestro de Productos (PRODUCTO)
        </button>
      </div>

      <!-- Pestaña 1: Ofertas Mayoristas (DET_PROD_PROV) -->
      <section v-if="activeTab === 'ofertas'" class="supp-panel">
        <div class="section-top">
          <div>
            <h3>Suministros y Productos para Salones de Belleza</h3>
            <p>Productos con precios preferenciales al por mayor, tiempos de entrega y stock garantizado.</p>
          </div>
          <button class="btn-primary" @click="showOfferModal = true">+ Publicar Oferta (DET_PROD_PROV)</button>
        </div>

        <div v-if="pendingSuppliers" class="loading-state">Cargando ofertas mayoristas...</div>

        <div v-else-if="!currentSupplier?.productosOfrecidos || currentSupplier.productosOfrecidos.length === 0" class="empty-card">
          <span class="empty-icon">📦</span>
          <h3>Aún no tienes ofertas mayoristas publicadas</h3>
          <p>Publica tus insumos capilares, tratamientos y tintes para que los locales de belleza te compren al por mayor.</p>
          <button class="btn-primary" style="margin-top: 14px;" @click="showOfferModal = true">Publicar Primera Oferta</button>
        </div>

        <div v-else class="offers-grid">
          <article v-for="offer in currentSupplier.productosOfrecidos" :key="offer._id" class="offer-card">
            <img :src="offer.idProducto?.imagen || defaultProdImg" class="offer-img" />
            <div class="offer-body">
              <span class="category-pill">{{ offer.idProducto?.categoria || 'General' }}</span>
              <h4>{{ offer.idProducto?.nombre }}</h4>
              <p>{{ offer.idProducto?.descripcion }}</p>

              <div class="offer-meta-grid">
                <div class="meta-box">
                  <small>Precio Mayoreo:</small>
                  <strong class="price-highlight">${{ formatPrice(offer.precioMayoreo) }}</strong>
                </div>
                <div class="meta-box">
                  <small>Stock Proveedor:</small>
                  <strong>{{ offer.stockProveedor }} unids</strong>
                </div>
                <div class="meta-box full">
                  <small>Tiempo de Entrega:</small>
                  <span>⏱️ {{ offer.tiempoEntrega }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Pestaña 2: Maestro de Productos (PRODUCTO) -->
      <section v-if="activeTab === 'maestro'" class="supp-panel">
        <div class="section-top">
          <div>
            <h3>Catálogo Maestro de Productos Registrados (PRODUCTO)</h3>
            <p>Lista general de productos disponibles en toda la plataforma LookBy.</p>
          </div>
          <button class="btn-primary" @click="showProductModal = true">+ Registrar Producto</button>
        </div>

        <div class="master-products-grid">
          <article v-for="prod in masterProducts" :key="prod._id" class="master-prod-card">
            <img :src="prod.imagen || defaultProdImg" class="prod-thumb" />
            <div class="prod-info">
              <span class="category-pill">{{ prod.categoria || 'General' }}</span>
              <h4>{{ prod.nombre }}</h4>
              <p>{{ prod.descripcion }}</p>
              <div class="prod-price-tag">
                <span>Precio Base Sugerido:</span>
                <strong>${{ formatPrice(prod.precio) }}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Modal Publicar Oferta Mayorista (DET_PROD_PROV) -->
    <div v-if="showOfferModal" class="modal-overlay" @click.self="showOfferModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <span class="modal-eyebrow">Oferta Mayorista</span>
            <h3>Publicar Insumo en Red (DET_PROD_PROV)</h3>
          </div>
          <button class="btn-close" @click="showOfferModal = false">✕</button>
        </div>

        <form @submit.prevent="submitSupplyOffer" class="modal-form">
          <div class="form-group">
            <label>Selecciona el Producto Maestro (PRODUCTO):</label>
            <select v-model="offerForm.idProducto" class="input-field" required>
              <option value="">-- Seleccionar Producto --</option>
              <option v-for="p in masterProducts" :key="p._id" :value="p._id">
                {{ p.nombre }} (Precio Base: ${{ formatPrice(p.precio) }})
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio Mayorista ($):</label>
              <input
                v-model.number="offerForm.precioMayoreo"
                type="number"
                min="0"
                class="input-field"
                required
              />
            </div>
            <div class="form-group">
              <label>Stock de Proveedor:</label>
              <input
                v-model.number="offerForm.stockProveedor"
                type="number"
                min="0"
                class="input-field"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label>Tiempo de Entrega Estimado:</label>
            <input
              v-model="offerForm.tiempoEntrega"
              type="text"
              class="input-field"
              placeholder="Ej. 24 a 48 horas, Inmediato, 3 a 5 días hábiles"
              required
            />
          </div>

          <div v-if="offerError" class="modal-error">{{ offerError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showOfferModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="submittingOffer">
              {{ submittingOffer ? 'Guardando...' : 'Publicar Oferta Mayorista' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Registrar Producto Maestro (PRODUCTO) -->
    <div v-if="showProductModal" class="modal-overlay" @click.self="showProductModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <span class="modal-eyebrow">Catálogo Maestro</span>
            <h3>Registrar Nuevo Producto (PRODUCTO)</h3>
          </div>
          <button class="btn-close" @click="showProductModal = false">✕</button>
        </div>

        <form @submit.prevent="submitMasterProduct" class="modal-form">
          <div class="form-group">
            <label>Nombre del Producto:</label>
            <input
              v-model="productForm.nombre"
              type="text"
              class="input-field"
              placeholder="Ej. Tinte Profesional Sin Amoníaco 60ml"
              required
            />
          </div>

          <div class="form-group">
            <label>Descripción:</label>
            <textarea
              v-model="productForm.descripcion"
              rows="3"
              class="input-field"
              placeholder="Características, fórmula, ingredientes o uso..."
              required
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio Base Sugerido ($):</label>
              <input
                v-model.number="productForm.precio"
                type="number"
                min="0"
                class="input-field"
                required
              />
            </div>
            <div class="form-group">
              <label>Categoría:</label>
              <select v-model="productForm.categoria" class="input-field">
                <option value="Productos">Productos Capilares</option>
                <option value="Servicios">Servicios & Tratamientos</option>
                <option value="General">Insumos Generales</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>URL de Imagen:</label>
            <input
              v-model="productForm.imagen"
              type="url"
              class="input-field"
              placeholder="https://..."
            />
          </div>

          <div v-if="productError" class="modal-error">{{ productError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showProductModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="submittingProduct">
              {{ submittingProduct ? 'Guardando...' : 'Crear Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

definePageMeta({
  middleware: ['admin-auth']
})

const authStore = useAuthStore()
const activeTab = ref<'ofertas' | 'maestro'>('ofertas')
const defaultProdImg = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'

// 1. Consultar Proveedores (PROVEEDOR & DET_PROD_PROV)
const { data: suppliersData, pending: pendingSuppliers, refresh: refreshSuppliers } = await useFetch<{ success: boolean; data: any[] }>('/api/suppliers')
const suppliers = computed(() => suppliersData.value?.data || [])
const currentSupplier = computed(() => suppliers.value[0] || null)

// 2. Consultar Maestro de Productos (PRODUCTO)
const { data: productsData, refresh: refreshProducts } = await useFetch<{ success: boolean; data: any[] }>('/api/products')
const masterProducts = computed(() => productsData.value?.data || [])

// Modal Oferta Mayorista (DET_PROD_PROV)
const showOfferModal = ref(false)
const submittingOffer = ref(false)
const offerError = ref('')
const offerForm = reactive({
  idProducto: '',
  precioMayoreo: 25000,
  stockProveedor: 100,
  tiempoEntrega: '24 a 48 horas'
})

const submitSupplyOffer = async () => {
  if (!currentSupplier.value?._id) return
  submittingOffer.value = true
  offerError.value = ''

  try {
    await $fetch('/api/suppliers/supply-items', {
      method: 'POST',
      body: {
        idProveedor: currentSupplier.value._id,
        idProducto: offerForm.idProducto,
        precioMayoreo: offerForm.precioMayoreo,
        stockProveedor: offerForm.stockProveedor,
        tiempoEntrega: offerForm.tiempoEntrega
      }
    })
    showOfferModal.value = false
    await refreshSuppliers()
  } catch (err: any) {
    offerError.value = err?.data?.statusMessage || err?.message || 'Error al publicar oferta mayorista.'
  } finally {
    submittingOffer.value = false
  }
}

// Modal Producto Maestro (PRODUCTO)
const showProductModal = ref(false)
const submittingProduct = ref(false)
const productError = ref('')
const productForm = reactive({
  nombre: '',
  descripcion: '',
  precio: 35000,
  categoria: 'Productos',
  imagen: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80'
})

const submitMasterProduct = async () => {
  submittingProduct.value = true
  productError.value = ''

  try {
    await $fetch('/api/products', {
      method: 'POST',
      body: productForm
    })
    showProductModal.value = false
    productForm.nombre = ''
    productForm.descripcion = ''
    await refreshProducts()
  } catch (err: any) {
    productError.value = err?.data?.statusMessage || err?.message || 'Error al registrar producto.'
  } finally {
    submittingProduct.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
}

const formatPrice = (val: number) => {
  return (val || 0).toLocaleString('es-CO')
}
</script>

<style scoped>
.supplier-shell {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-body);
}

.supplier-navbar {
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
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-emoji {
  font-size: 1.6rem;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-title);
}

.portal-badge {
  background-color: rgba(200, 157, 124, 0.15);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.supplier-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.supplier-banner {
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-subtle) 100%);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.eyebrow-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
}

.supplier-banner h2 {
  font-size: 1.8rem;
  color: var(--text-title);
  margin: 4px 0;
}

.badge-role {
  background: var(--primary);
  color: #fff;
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
}

/* Tabs */
.supplier-tabs-nav {
  display: flex;
  gap: 12px;
  border-bottom: 2px solid var(--border);
}

.supp-tab-btn {
  background: transparent;
  border: none;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-body);
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease;
}

.supp-tab-btn.active {
  color: var(--primary);
  border-color: var(--primary);
}

.supp-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.section-top h3 {
  font-size: 1.4rem;
  color: var(--text-title);
}

.offers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.offer-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
}

.offer-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
}

.offer-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.category-pill {
  background: rgba(200, 157, 124, 0.15);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
  width: fit-content;
}

.offer-meta-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.meta-box {
  display: flex;
  flex-direction: column;
}

.meta-box.full {
  grid-column: 1 / -1;
}

.price-highlight {
  color: var(--accent);
  font-size: 1.2rem;
}

/* Master Products Grid */
.master-products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.master-prod-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  gap: 14px;
  box-shadow: var(--shadow);
}

.prod-thumb {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  object-fit: cover;
}

.prod-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.prod-price-tag {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.empty-card {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border: 1px dashed var(--border);
  border-radius: 20px;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

/* Modal */
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
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  padding: 24px;
  box-shadow: var(--shadow);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.modal-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
