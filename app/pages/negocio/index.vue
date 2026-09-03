<template>
  <div class="business-dashboard">
    <!-- Header del Dashboard -->
    <header class="dash-header">
      <div class="dash-welcome">
        <span class="eyebrow-tag">Gestión Integral de Salón</span>
        <h1>Panel del Local de Belleza (LOCAL_BELLEZA)</h1>
        <p>Bienvenido, <strong>{{ authStore.user?.nombre || authStore.user?.name }}</strong> ({{ activeSalon?.nombreLocal || 'LookBy Studio & Spa' }})</p>
      </div>

      <div class="dash-actions">
        <button class="btn-primary" @click="showNewCatalogModal = true">+ Nuevo Catálogo (CATALOGO)</button>
        <NuxtLink to="/admin/citas" class="btn-secondary">📅 Ver Agenda</NuxtLink>
        <button class="btn-secondary" :disabled="pendingStats" @click="() => refreshAll()">
          🔄 {{ pendingStats ? 'Actualizando...' : 'Refrescar' }}
        </button>
      </div>
    </header>

    <!-- Métricas Generales del Local -->
    <section class="metrics-grid">
      <article class="metric-card">
        <div class="metric-icon income">⭐</div>
        <div class="metric-details">
          <span class="metric-title">Calificación del Local</span>
          <strong class="metric-value">{{ activeSalon?.calificacionPromedio ? activeSalon.calificacionPromedio.toFixed(1) : '5.0' }} / 5.0</strong>
          <small class="metric-hint">{{ activeSalon?.totalCalificaciones || 1 }} reseñas de clientes (CALIFICACION)</small>
        </div>
      </article>

      <article class="metric-card">
        <div class="metric-icon today">💵</div>
        <div class="metric-details">
          <span class="metric-title">Ingresos del Mes</span>
          <strong class="metric-value">${{ (stats?.monthlyRevenue || 0).toLocaleString('es-CO') }}</strong>
          <small class="metric-hint">Servicios y pedidos completados</small>
        </div>
      </article>

      <article class="metric-card">
        <div class="metric-icon total">📦</div>
        <div class="metric-details">
          <span class="metric-title">Pedidos de Clientes</span>
          <strong class="metric-value">{{ orders.length }}</strong>
          <small class="metric-hint">Órdenes registradas (PEDIDO)</small>
        </div>
      </article>

      <article class="metric-card">
        <div class="metric-icon clients">📂</div>
        <div class="metric-details">
          <span class="metric-title">Catálogos Activos</span>
          <strong class="metric-value">{{ catalogs.length }}</strong>
          <small class="metric-hint">Categorías de productos (CATALOGO)</small>
        </div>
      </article>
    </section>

    <!-- Pestañas de Gestión del Salón -->
    <div class="negocio-tabs-nav">
      <button :class="['negocio-tab-btn', { active: activeTab === 'catalogos' }]" @click="activeTab = 'catalogos'">
        📂 Catálogos & Productos (CATALOGO / DET_PROD_CAT)
      </button>
      <button :class="['negocio-tab-btn', { active: activeTab === 'pedidos' }]" @click="activeTab = 'pedidos'">
        📦 Pedidos de Clientes (PEDIDO & DET_PEDIDO)
      </button>
      <button :class="['negocio-tab-btn', { active: activeTab === 'local' }]" @click="activeTab = 'local'">
        🏢 Perfil del Local (LOCAL_BELLEZA)
      </button>
      <button :class="['negocio-tab-btn', { active: activeTab === 'proveedores' }]" @click="activeTab = 'proveedores'">
        🛒 Abastecimiento Mayorista (DET_PROD_PROV)
      </button>
    </div>

    <!-- Pestaña 1: Catálogos & Productos Asociados (CATALOGO / DET_PROD_CAT) -->
    <section v-if="activeTab === 'catalogos'" class="tab-content-panel">
      <div class="panel-header-row">
        <div>
          <h3>Catálogos del Salón y Productos Asociados</h3>
          <p>Organiza tus servicios y productos capilares con precios y stock específicos para tu local.</p>
        </div>
        <button class="btn-primary" @click="showNewCatalogModal = true">+ Crear Catálogo</button>
      </div>

      <div v-if="catalogs.length === 0" class="empty-box">
        <p>Aún no has creado catálogos para tu local. ¡Crea el primero!</p>
      </div>

      <div v-else class="catalogs-accordion">
        <div v-for="cat in catalogs" :key="cat._id" class="catalog-card">
          <div class="catalog-card-header">
            <div>
              <span class="cat-pill">CATALOGO #{{ String(cat._id).substring(18) }}</span>
              <h4>{{ cat.tipoCatalogo }}</h4>
              <p>{{ cat.descripcion || 'Sin descripción adicional' }}</p>
            </div>
            <button class="btn-secondary btn-sm" @click="openAddProductToCatalogModal(cat)">
              + Asociar Producto (DET_PROD_CAT)
            </button>
          </div>

          <!-- Items del Catálogo -->
          <div class="catalog-items-wrap">
            <h5 class="sub-label">Productos asociados a este catálogo:</h5>
            <CatalogItemsList :catalog-id="cat._id" />
          </div>
        </div>
      </div>
    </section>

    <!-- Pestaña 2: Pedidos de Clientes (PEDIDO & DET_PEDIDO) -->
    <section v-if="activeTab === 'pedidos'" class="tab-content-panel">
      <div class="panel-header-row">
        <div>
          <h3>Gestión de Pedidos de Clientes</h3>
          <p>Supervisa las compras realizadas por clientes y actualiza su estado de preparación o entrega.</p>
        </div>
        <button class="btn-secondary" @click="() => refreshOrders()">🔄 Actualizar Pedidos</button>
      </div>

      <div v-if="orders.length === 0" class="empty-box">
        <p>No hay pedidos registrados en este momento.</p>
      </div>

      <div v-else class="orders-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente (USUARIO)</th>
              <th>Fecha</th>
              <th>Ítems (DET_PEDIDO)</th>
              <th>Monto Total (montoTotal)</th>
              <th>Estado Actual</th>
              <th>Cambiar Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ord in orders" :key="ord._id">
              <td><strong>#{{ String(ord._id).substring(18) }}</strong></td>
              <td>
                <div class="user-meta-cell">
                  <strong>{{ ord.idUsuario?.nombre || 'Cliente' }}</strong>
                  <small>{{ ord.idUsuario?.telefono || ord.idUsuario?.correo }}</small>
                </div>
              </td>
              <td>{{ formatDate(ord.fecha) }}</td>
              <td>
                <ul class="order-items-mini-list">
                  <li v-for="det in ord.detalles" :key="det._id">
                    {{ det.cantidad }}x {{ det.idProducto?.nombre }} (${{ formatPrice(det.subTotal) }})
                  </li>
                </ul>
              </td>
              <td><strong class="price-highlight">${{ formatPrice(ord.montoTotal) }}</strong></td>
              <td>
                <span :class="['status-tag', ord.estado.toLowerCase().replace(' ', '-')]">{{ ord.estado }}</span>
              </td>
              <td>
                <select :value="ord.estado" class="status-select" @change="updateOrderStatus(ord._id, ($event.target as HTMLSelectElement).value)">
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Preparación">En Preparación</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Pestaña 3: Perfil del Local de Belleza (LOCAL_BELLEZA) -->
    <section v-if="activeTab === 'local'" class="tab-content-panel">
      <div class="panel-header-row">
        <div>
          <h3>Configuración del Local de Belleza</h3>
          <p>Datos visibles para los clientes en la portada y catálogo público.</p>
        </div>
      </div>

      <div class="salon-profile-grid">
        <div class="salon-profile-card">
          <img :src="activeSalon?.imagen || defaultSalonImg" class="salon-profile-banner" />
          <div class="salon-profile-body">
            <h3>{{ activeSalon?.nombreLocal || 'LookBy Studio & Spa' }}</h3>
            <p>{{ activeSalon?.descripcion }}</p>
            <div class="meta-row">
              <span>📍 Dirección: <strong>{{ activeSalon?.direccion || 'Bogotá, Colombia' }}</strong></span>
              <span>🕒 Horario: <strong>{{ activeSalon?.horario }}</strong></span>
              <span>📞 Teléfono: <strong>{{ activeSalon?.telefono }}</strong></span>
              <span>⭐ Calificación: <strong>{{ activeSalon?.calificacionPromedio?.toFixed(1) || '5.0' }} ({{ activeSalon?.totalCalificaciones || 1 }} reseñas)</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pestaña 4: Abastecimiento Mayorista (DET_PROD_PROV) -->
    <section v-if="activeTab === 'proveedores'" class="tab-content-panel">
      <div class="panel-header-row">
        <div>
          <h3>Catálogo de Abastecimiento Mayorista (DET_PROD_PROV)</h3>
          <p>Insumos y productos profesionales ofrecidos directamente por proveedores registrados.</p>
        </div>
      </div>

      <div class="suppliers-grid">
        <article v-for="supp in suppliers" :key="supp._id" class="supplier-box">
          <div class="supp-top">
            <span class="supp-icon">🏢</span>
            <div>
              <h4>{{ supp.razonSocial }}</h4>
              <small>{{ supp.contacto }}</small>
            </div>
          </div>

          <div class="supp-items">
            <strong>Ofertas Disponibles:</strong>
            <div v-for="it in supp.productosOfrecidos" :key="it._id" class="supp-item-row">
              <div>
                <strong>{{ it.idProducto?.nombre }}</strong>
                <small>Tiempo de entrega: {{ it.tiempoEntrega }} | Stock: {{ it.stockProveedor }} unids</small>
              </div>
              <strong class="wholesale-price">${{ formatPrice(it.precioMayoreo) }} (Mayoreo)</strong>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Modal Nuevo Catálogo (CATALOGO) -->
    <div v-if="showNewCatalogModal" class="modal-overlay" @click.self="showNewCatalogModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <span class="modal-eyebrow">Crear Catálogo</span>
            <h3>Nuevo Catálogo de Local (CATALOGO)</h3>
          </div>
          <button class="btn-close" @click="showNewCatalogModal = false">✕</button>
        </div>

        <form @submit.prevent="createCatalog" class="modal-form">
          <div class="form-group">
            <label>Tipo de Catálogo:</label>
            <input
              v-model="catalogForm.tipoCatalogo"
              type="text"
              class="input-field"
              placeholder="Ej. Servicios de Peluquería, Tratamientos Faciales, Productos Capilares"
              required
            />
          </div>

          <div class="form-group">
            <label>Descripción del Catálogo:</label>
            <textarea
              v-model="catalogForm.descripcion"
              rows="3"
              class="input-field"
              placeholder="Breve descripción de los productos o servicios que contiene..."
            ></textarea>
          </div>

          <div v-if="catalogModalError" class="modal-error">{{ catalogModalError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showNewCatalogModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="savingCatalog">
              {{ savingCatalog ? 'Guardando...' : 'Crear Catálogo' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Asociar Producto a Catálogo (DET_PROD_CAT) -->
    <div v-if="selectedCatalogForProduct" class="modal-overlay" @click.self="selectedCatalogForProduct = null">
      <div class="modal-box">
        <div class="modal-header">
          <div>
            <span class="modal-eyebrow">Asociar Producto</span>
            <h3>Agregar al Catálogo: {{ selectedCatalogForProduct.tipoCatalogo }}</h3>
          </div>
          <button class="btn-close" @click="selectedCatalogForProduct = null">✕</button>
        </div>

        <form @submit.prevent="associateProductToCatalog" class="modal-form">
          <div class="form-group">
            <label>Selecciona el Producto Maestro (PRODUCTO):</label>
            <select v-model="catalogItemForm.idProducto" class="input-field" required>
              <option value="">-- Seleccionar Producto --</option>
              <option v-for="p in masterProducts" :key="p._id" :value="p._id">
                {{ p.nombre }} (Precio Base: ${{ formatPrice(p.precio) }})
              </option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio Local en Salón ($):</label>
              <input
                v-model.number="catalogItemForm.precioLocal"
                type="number"
                min="0"
                class="input-field"
                required
              />
            </div>
            <div class="form-group">
              <label>Stock Disponible:</label>
              <input
                v-model.number="catalogItemForm.stockDisponible"
                type="number"
                min="0"
                class="input-field"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="catalogItemForm.disponibilidad" type="checkbox" />
              <span>Disponible para compra o agendamiento</span>
            </label>
          </div>

          <div v-if="catalogItemError" class="modal-error">{{ catalogItemError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="selectedCatalogForProduct = null">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="savingCatalogItem">
              {{ savingCatalogItem ? 'Guardando...' : 'Asociar a Catálogo' }}
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
  layout: 'admin',
  middleware: ['admin-auth']
})

const authStore = useAuthStore()
const activeTab = ref<'catalogos' | 'pedidos' | 'local' | 'proveedores'>('catalogos')
const defaultSalonImg = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'

// 1. Estadísticas
const { data: statsData, pending: pendingStats, refresh: refreshStats } = await useFetch<{ success: boolean; data: any }>('/api/dashboard/stats')
const stats = computed(() => statsData.value?.data || null)

// 2. Locales de Belleza (LOCAL_BELLEZA)
const { data: salonsData, refresh: refreshSalons } = await useFetch<{ success: boolean; data: any[] }>('/api/beauty-salons')
const activeSalon = computed(() => salonsData.value?.data?.[0] || null)

// 3. Catálogos (CATALOGO)
const { data: catalogsData, refresh: refreshCatalogs } = await useFetch<{ success: boolean; data: any[] }>('/api/catalogs')
const catalogs = computed(() => catalogsData.value?.data || [])

// 4. Pedidos (PEDIDO & DET_PEDIDO)
const { data: ordersData, refresh: refreshOrders } = await useFetch<{ success: boolean; data: any[] }>('/api/orders')
const orders = computed(() => ordersData.value?.data || [])

// 5. Proveedores (PROVEEDOR & DET_PROD_PROV)
const { data: suppliersData, refresh: refreshSuppliers } = await useFetch<{ success: boolean; data: any[] }>('/api/suppliers')
const suppliers = computed(() => suppliersData.value?.data || [])

// 6. Maestro de Productos (PRODUCTO)
const { data: productsData } = await useFetch<{ success: boolean; data: any[] }>('/api/products')
const masterProducts = computed(() => productsData.value?.data || [])

// Modal Catálogo
const showNewCatalogModal = ref(false)
const savingCatalog = ref(false)
const catalogModalError = ref('')
const catalogForm = reactive({
  tipoCatalogo: '',
  descripcion: ''
})

const createCatalog = async () => {
  if (!activeSalon.value?._id) return
  savingCatalog.value = true
  catalogModalError.value = ''

  try {
    await $fetch('/api/catalogs', {
      method: 'POST',
      body: {
        idLocal: activeSalon.value._id,
        tipoCatalogo: catalogForm.tipoCatalogo,
        descripcion: catalogForm.descripcion
      }
    })
    showNewCatalogModal.value = false
    catalogForm.tipoCatalogo = ''
    catalogForm.descripcion = ''
    await refreshCatalogs()
  } catch (err: any) {
    catalogModalError.value = err?.data?.statusMessage || err?.message || 'Error al crear catálogo.'
  } finally {
    savingCatalog.value = false
  }
}

// Modal Asociar Producto a Catálogo (DET_PROD_CAT)
const selectedCatalogForProduct = ref<any>(null)
const savingCatalogItem = ref(false)
const catalogItemError = ref('')
const catalogItemForm = reactive({
  idProducto: '',
  precioLocal: 0,
  stockDisponible: 10,
  disponibilidad: true
})

const openAddProductToCatalogModal = (cat: any) => {
  selectedCatalogForProduct.value = cat
  catalogItemForm.idProducto = ''
  catalogItemForm.precioLocal = 35000
  catalogItemForm.stockDisponible = 10
  catalogItemForm.disponibilidad = true
  catalogItemError.value = ''
}

const associateProductToCatalog = async () => {
  if (!selectedCatalogForProduct.value) return
  savingCatalogItem.value = true
  catalogItemError.value = ''

  try {
    await $fetch(`/api/catalogs/${selectedCatalogForProduct.value._id}/items`, {
      method: 'POST',
      body: catalogItemForm
    })
    selectedCatalogForProduct.value = null
    await refreshCatalogs()
  } catch (err: any) {
    catalogItemError.value = err?.data?.statusMessage || err?.message || 'Error al asociar producto.'
  } finally {
    savingCatalogItem.value = false
  }
}

// Actualizar Estado de Pedido (PEDIDO)
const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    await $fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      body: { estado: newStatus }
    })
    await refreshOrders()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Error al actualizar el estado del pedido.')
  }
}

const refreshAll = async () => {
  await Promise.all([refreshStats(), refreshSalons(), refreshCatalogs(), refreshOrders(), refreshSuppliers()])
}

const formatPrice = (val: number) => {
  return (val || 0).toLocaleString('es-CO')
}

const formatDate = (d: string) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })
}

// Subcomponente reactivo para listar items por catálogo
const CatalogItemsList = defineComponent({
  props: { catalogId: { type: String, required: true } },
  async setup(props) {
    const { data: itemsData, refresh } = await useFetch<{ success: boolean; data: any[] }>(`/api/catalogs/${props.catalogId}/items`)
    const items = computed(() => itemsData.value?.data || [])
    return () => {
      if (!items.value.length) {
        return h('p', { class: 'empty-sub' }, 'No hay productos asociados en este catálogo aún.')
      }
      return h(
        'div',
        { class: 'catalog-items-subgrid' },
        items.value.map((it) =>
          h('div', { class: 'cat-sub-item', key: it._id }, [
            h('strong', it.idProducto?.nombre || 'Producto'),
            h('div', { class: 'sub-price-row' }, [
              h('span', { class: 'sub-price' }, `$${(it.precioLocal || 0).toLocaleString('es-CO')}`),
              h('span', { class: 'sub-stock' }, `Stock: ${it.stockDisponible}`)
            ])
          ])
        )
      )
    }
  }
})
</script>

<style scoped>
.business-dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.eyebrow-tag {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
}

.dash-welcome h1 {
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  color: var(--text-title);
  margin: 4px 0;
}

.dash-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  background: rgba(200, 157, 124, 0.15);
}

.metric-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-title {
  font-size: 0.85rem;
  color: var(--text-body);
  font-weight: 600;
}

.metric-value {
  font-size: 1.5rem;
  color: var(--text-title);
}

.metric-hint {
  font-size: 0.72rem;
  color: var(--text-body);
  opacity: 0.7;
}

/* Tabs */
.negocio-tabs-nav {
  display: flex;
  gap: 10px;
  border-bottom: 2px solid var(--border);
  overflow-x: auto;
}

.negocio-tab-btn {
  background: transparent;
  border: none;
  padding: 12px 18px;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-body);
  border-bottom: 3px solid transparent;
  cursor: pointer;
  white-space: nowrap;
}

.negocio-tab-btn.active {
  color: var(--primary);
  border-color: var(--primary);
}

.tab-content-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.panel-header-row h3 {
  font-size: 1.3rem;
  color: var(--text-title);
}

.catalogs-accordion {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.catalog-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.catalog-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.cat-pill {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary);
  text-transform: uppercase;
}

.sub-label {
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 8px;
}

:deep(.catalog-items-subgrid) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

:deep(.cat-sub-item) {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

:deep(.sub-price-row) {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

:deep(.sub-price) {
  color: var(--primary-hover);
  font-weight: 700;
}

/* Orders Table */
.orders-table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px;
  font-size: 0.8rem;
  color: var(--text-body);
  border-bottom: 1px solid var(--border);
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
  font-size: 0.88rem;
}

.order-items-mini-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-tag.pendiente {
  background: rgba(255, 193, 7, 0.15);
  color: #d39e00;
}

.status-tag.en-preparación {
  background: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.status-tag.completado {
  background: rgba(25, 135, 84, 0.15);
  color: #198754;
}

.status-select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-body);
  font-size: 0.85rem;
}

/* Salon Profile */
.salon-profile-card {
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  background: var(--bg-subtle);
}

.salon-profile-banner {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.salon-profile-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.meta-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  font-size: 0.9rem;
  margin-top: 10px;
}

/* Suppliers Boxes */
.suppliers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.supplier-box {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.supp-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.supp-icon {
  font-size: 1.8rem;
}

.supp-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  padding: 8px 12px;
  border-radius: 8px;
  margin-top: 6px;
  font-size: 0.85rem;
}

.wholesale-price {
  color: var(--accent);
}

/* Modal styles */
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.empty-box {
  text-align: center;
  padding: 40px;
  color: var(--text-body);
}
</style>
