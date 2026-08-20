<template>
  <div class="supplier-shell">
    <header class="supplier-navbar">
      <div class="navbar-container">
        <NuxtLink to="/proveedor" class="brand-logo">
          <span class="logo-emoji">📦</span>
          <span class="logo-text">LookBy</span>
          <span class="portal-badge">Portal Proveedor</span>
        </NuxtLink>

        <div class="nav-actions">
          <ThemeToggle />
          <button class="btn-primary nav-btn" @click="openCreateModal">+ Publicar Insumo/Producto</button>
          <button class="btn-secondary nav-btn logout" @click="handleLogout">Cerrar Sesión</button>
        </div>
      </div>
    </header>

    <main class="supplier-content">
      <!-- Banner -->
      <section class="supplier-banner">
        <div>
          <h2>{{ authStore.user?.businessName || authStore.user?.name || 'Distribuidora de Belleza' }}</h2>
          <p>Catálogo de suministros y productos al por mayor para salones de belleza y barberías.</p>
        </div>
        <span class="badge-role">Proveedor Autorizado</span>
      </section>

      <!-- Catálogo de Insumos -->
      <section class="products-section">
        <div class="section-top">
          <h3>Mis Productos & Suministros Disponibles ({{ products.length }})</h3>
          <button class="btn-refresh" :disabled="pending" @click="() => refresh()">
            🔄 {{ pending ? 'Actualizando...' : 'Refrescar' }}
          </button>
        </div>

        <div v-if="pending" class="loading-state">Cargando catálogo de proveedor...</div>

        <div v-else-if="!products || products.length === 0" class="empty-card">
          <span class="empty-icon">📦</span>
          <h3>No has publicado productos aún</h3>
          <p>Comienza publicando tus insumos, tintes, champús o herramientas para abastecer negocios.</p>
          <button class="btn-primary" style="margin-top: 14px;" @click="openCreateModal">Publicar Primer Producto</button>
        </div>

        <div v-else class="supplier-grid">
          <article v-for="item in products" :key="item._id" class="product-card">
            <div class="card-top">
              <span class="cat-pill">{{ item.category || 'General' }}</span>
              <span class="sku-tag">SKU: {{ item.sku || 'N/A' }}</span>
            </div>

            <div class="card-body">
              <h4>{{ item.name }}</h4>
              <p>Disponibilidad en almacén:</p>
              <strong class="stock-num">{{ item.stock }} {{ item.unit || 'unidades' }}</strong>
            </div>

            <div class="card-footer">
              <div class="price-box">
                <small>Precio Mayoreo:</small>
                <strong>${{ (item.costPrice || item.salePrice || 0).toLocaleString('es-CO') }}</strong>
              </div>

              <div class="actions-box">
                <button class="btn-icon" title="Editar" @click="openEditModal(item)">✏️</button>
                <button class="btn-icon delete" title="Eliminar" @click="deleteItem(item._id)">🗑️</button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Modal de Producto -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ editingId ? 'Editar Insumo' : 'Publicar Nuevo Insumo' }}</h2>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="handleSave">
          <label>
            <span>Nombre del Producto / Insumo *</span>
            <input v-model="form.name" class="input-field" placeholder="Ej. Tinte Profesional 60ml x 12 uds" required />
          </label>

          <div class="form-row">
            <label>
              <span>Código SKU</span>
              <input v-model="form.sku" class="input-field" placeholder="Ej. PROV-001" />
            </label>

            <label>
              <span>Categoría</span>
              <input v-model="form.category" class="input-field" placeholder="Ej. Tinturas y Coloración" />
            </label>
          </div>

          <div class="form-row">
            <label>
              <span>Cantidad en Stock *</span>
              <input v-model.number="form.stock" type="number" min="0" class="input-field" required />
            </label>

            <label>
              <span>Unidad</span>
              <select v-model="form.unit" class="input-field">
                <option value="cajas">Cajas</option>
                <option value="unidades">Unidades</option>
                <option value="frascos">Frascos</option>
                <option value="galones">Galones</option>
              </select>
            </label>
          </div>

          <label>
            <span>Precio al Por Mayor ($) *</span>
            <input v-model.number="form.costPrice" type="number" min="0" class="input-field" required />
          </label>

          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="formSubmitting">
              {{ formSubmitting ? 'Guardando...' : 'Publicar Producto' }}
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

const { data, pending, refresh } = await useFetch<{ success: boolean; data: any[] }>('/api/inventory')
const products = computed(() => data.value?.data || [])

// Modal
const showModal = ref(false)
const editingId = ref<string | null>(null)
const formSubmitting = ref(false)
const formError = ref('')

const form = reactive({
  name: '',
  sku: '',
  category: 'Insumos',
  stock: 50,
  unit: 'cajas',
  costPrice: 50000,
  salePrice: 50000
})

const openCreateModal = () => {
  editingId.value = null
  formError.value = ''
  form.name = ''
  form.sku = ''
  form.category = 'Insumos'
  form.stock = 50
  form.unit = 'cajas'
  form.costPrice = 50000
  form.salePrice = 50000
  showModal.value = true
}

const openEditModal = (item: any) => {
  editingId.value = item._id
  formError.value = ''
  form.name = item.name || ''
  form.sku = item.sku || ''
  form.category = item.category || 'Insumos'
  form.stock = item.stock || 0
  form.unit = item.unit || 'cajas'
  form.costPrice = item.costPrice || 0
  form.salePrice = item.salePrice || 0
  showModal.value = true
}

const handleSave = async () => {
  formError.value = ''
  formSubmitting.value = true

  try {
    if (editingId.value) {
      await $fetch(`/api/inventory/${editingId.value}`, {
        method: 'PUT',
        body: form
      })
    } else {
      await $fetch('/api/inventory', {
        method: 'POST',
        body: form
      })
    }
    showModal.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || err?.message || 'Error al guardar.'
  } finally {
    formSubmitting.value = false
  }
}

const deleteItem = async (id: string) => {
  if (!confirm('¿Eliminar este insumo?')) return
  try {
    await $fetch(`/api/inventory/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    console.error(e)
  }
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.supplier-shell {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-body);
  display: flex;
  flex-direction: column;
}

.supplier-navbar {
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logo-emoji {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-title);
}

.portal-badge {
  background: rgba(200, 157, 124, 0.15);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 6px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-btn {
  padding: 8px 14px;
  font-size: 0.85rem;
}

.nav-btn.logout:hover {
  background-color: rgba(182, 46, 46, 0.1);
  color: #b12a2a;
}

.supplier-content {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.supplier-banner {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 28px;
  box-shadow: var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.supplier-banner h2 {
  font-size: 1.5rem;
  color: var(--text-title);
  margin-bottom: 4px;
}

.badge-role {
  background: rgba(138, 154, 134, 0.15);
  color: var(--accent);
  padding: 6px 14px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.8rem;
}

.products-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-top h3 {
  font-size: 1.3rem;
  color: var(--text-title);
}

.btn-refresh {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-body);
}

.supplier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 22px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cat-pill {
  background: rgba(200, 157, 124, 0.12);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.sku-tag {
  font-size: 0.75rem;
  color: var(--text-body);
}

.card-body h4 {
  font-size: 1.15rem;
  color: var(--text-title);
  margin-bottom: 6px;
}

.card-body p {
  font-size: 0.82rem;
  color: var(--text-body);
}

.stock-num {
  font-size: 1.3rem;
  color: var(--accent);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.price-box {
  display: flex;
  flex-direction: column;
}

.price-box small {
  font-size: 0.72rem;
  color: var(--text-body);
}

.price-box strong {
  font-size: 1.2rem;
  color: var(--text-title);
}

.actions-box {
  display: flex;
  gap: 6px;
}

.btn-icon {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-icon:hover {
  background: var(--bg-card);
  border-color: var(--primary);
}

.btn-icon.delete:hover {
  background: rgba(182, 46, 46, 0.15);
  border-color: #b12a2a;
}

/* Modales */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  padding: 20px;
  z-index: 200;
}

.modal-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 22px;
  width: min(100%, 500px);
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.35rem;
  color: var(--text-title);
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--text-body);
  cursor: pointer;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-title);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-error {
  background: rgba(182, 46, 46, 0.1);
  color: #b12a2a;
  border: 1px solid rgba(182, 46, 46, 0.25);
  border-radius: 8px;
  padding: 10px;
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.loading-state,
.empty-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 48px 24px;
  text-align: center;
  color: var(--text-body);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
