<template>
  <div class="inventory-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Inventario & Stock</p>
        <h1>Control de Productos</h1>
      </div>
      <button class="btn-primary" @click="openCreateModal">+ Nuevo Producto</button>
    </div>

    <!-- Barra de Filtros y Alertas -->
    <div class="filters-card">
      <div class="filter-toggles">
        <button
          :class="['filter-btn', { active: !onlyLowStock }]"
          @click="onlyLowStock = false"
        >
          Todos los Productos ({{ allProductsCount }})
        </button>

        <button
          :class="['filter-btn warning', { active: onlyLowStock }]"
          @click="onlyLowStock = true"
        >
          ⚠️ Stock Crítico ({{ lowStockCount }})
        </button>
      </div>

      <div class="inventory-summary">
        <span>Valor estimado del inventario: <strong>${{ totalStockValue.toLocaleString('es-CO') }}</strong></span>
      </div>
    </div>

    <!-- Lista / Tabla de Productos -->
    <div v-if="pending" class="loading-state">Cargando inventario...</div>

    <div v-else-if="!products || products.length === 0" class="empty-state">
      <span class="empty-icon">📦</span>
      <h3>No hay productos registrados</h3>
      <p v-if="onlyLowStock">¡Excelente! No tienes productos con stock crítico en este momento.</p>
      <p v-else>Agrega tus productos de uso en cabina o venta directa a clientes.</p>
      <button v-if="!onlyLowStock" class="btn-primary" style="margin-top: 14px;" @click="openCreateModal">
        Registrar Primer Producto
      </button>
    </div>

    <div v-else class="inventory-table-card">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Existencias</th>
              <th>Costo</th>
              <th>Precio Venta</th>
              <th style="text-align: right;">Ajuste Rápido & Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in products" :key="item._id" :class="{ 'row-warning': item.stock <= item.minStock }">
              <td>
                <div class="product-cell">
                  <strong>{{ item.name }}</strong>
                  <small v-if="item.sku" class="sku-text">SKU: {{ item.sku }}</small>
                </div>
              </td>
              <td>
                <span class="cat-pill">{{ item.category || 'General' }}</span>
              </td>
              <td>
                <div class="stock-cell">
                  <span :class="['stock-badge', { low: item.stock <= item.minStock }]">
                    {{ item.stock }} {{ item.unit || 'unidades' }}
                  </span>
                  <small v-if="item.stock <= item.minStock" class="min-alert">⚠️ Mín: {{ item.minStock }}</small>
                </div>
              </td>
              <td>${{ (item.costPrice || 0).toLocaleString('es-CO') }}</td>
              <td>
                <strong class="price-text">${{ (item.salePrice || 0).toLocaleString('es-CO') }}</strong>
              </td>
              <td style="text-align: right;">
                <div class="row-actions">
                  <!-- Ajuste Rápido de Stock -->
                  <button class="btn-step" title="Disminuir stock" @click="adjustStock(item, -1)">-</button>
                  <button class="btn-step" title="Aumentar stock" @click="adjustStock(item, 1)">+</button>

                  <button class="btn-icon" title="Editar producto" @click="openEditModal(item)">✏️</button>
                  <button class="btn-icon delete" title="Eliminar producto" @click="deleteItem(item._id)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Crear / Editar Producto -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ editingId ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="handleSaveItem">
          <label>
            <span>Nombre del Producto *</span>
            <input v-model="form.name" class="input-field" placeholder="Ej. Champú Reparador 500ml" required />
          </label>

          <div class="form-row">
            <label>
              <span>Código SKU</span>
              <input v-model="form.sku" class="input-field" placeholder="Ej. PROD-001" />
            </label>

            <label>
              <span>Categoría</span>
              <input v-model="form.category" class="input-field" placeholder="Ej. Cuidado Capilar" />
            </label>
          </div>

          <div class="form-row">
            <label>
              <span>Stock Actual *</span>
              <input v-model.number="form.stock" type="number" min="0" class="input-field" required />
            </label>

            <label>
              <span>Stock Mínimo (Alerta)</span>
              <input v-model.number="form.minStock" type="number" min="0" class="input-field" required />
            </label>
          </div>

          <div class="form-row">
            <label>
              <span>Unidad de Medida</span>
              <select v-model="form.unit" class="input-field">
                <option value="unidades">Unidades (uds)</option>
                <option value="frascos">Frascos</option>
                <option value="cajas">Cajas</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="gramos">Gramos (g)</option>
              </select>
            </label>

            <label>
              <span>Costo de Compra ($)</span>
              <input v-model.number="form.costPrice" type="number" min="0" class="input-field" />
            </label>
          </div>

          <label>
            <span>Precio de Venta al Público ($)</span>
            <input v-model.number="form.salePrice" type="number" min="0" class="input-field" />
          </label>

          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="formSubmitting">
              {{ formSubmitting ? 'Guardando...' : (editingId ? 'Actualizar Producto' : 'Guardar Producto') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth']
})

const onlyLowStock = ref(false)

const queryParams = computed(() => {
  return onlyLowStock.value ? { lowStock: 'true' } : {}
})

const { data, pending, refresh } = await useFetch<{ success: boolean; data: any[] }>('/api/inventory', {
  query: queryParams
})

const products = computed(() => data.value?.data || [])

// Métricas de inventario
const allProductsCount = computed(() => products.value.length)
const lowStockCount = computed(() => products.value.filter((i) => i.stock <= i.minStock).length)
const totalStockValue = computed(() => {
  return products.value.reduce((acc, curr) => acc + (curr.stock * (curr.costPrice || curr.salePrice || 0)), 0)
})

// Modal Estado
const showModal = ref(false)
const editingId = ref<string | null>(null)
const formSubmitting = ref(false)
const formError = ref('')

const form = reactive({
  name: '',
  sku: '',
  category: 'General',
  stock: 10,
  minStock: 3,
  unit: 'unidades',
  costPrice: 0,
  salePrice: 0
})

const openCreateModal = () => {
  editingId.value = null
  formError.value = ''
  form.name = ''
  form.sku = ''
  form.category = 'General'
  form.stock = 10
  form.minStock = 3
  form.unit = 'unidades'
  form.costPrice = 0
  form.salePrice = 0
  showModal.value = true
}

const openEditModal = (item: any) => {
  editingId.value = item._id
  formError.value = ''
  form.name = item.name || ''
  form.sku = item.sku || ''
  form.category = item.category || 'General'
  form.stock = item.stock || 0
  form.minStock = item.minStock || 3
  form.unit = item.unit || 'unidades'
  form.costPrice = item.costPrice || 0
  form.salePrice = item.salePrice || 0
  showModal.value = true
}

const handleSaveItem = async () => {
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
    formError.value = err?.data?.statusMessage || err?.message || 'Error al guardar producto.'
  } finally {
    formSubmitting.value = false
  }
}

const adjustStock = async (item: any, delta: number) => {
  const newStock = Math.max(0, (item.stock || 0) + delta)
  try {
    await $fetch(`/api/inventory/${item._id}`, {
      method: 'PUT',
      body: { stock: newStock }
    })
    await refresh()
  } catch (e) {
    console.error('Error al ajustar stock:', e)
  }
}

const deleteItem = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar este producto del inventario?')) return

  try {
    await $fetch(`/api/inventory/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    console.error('Error al eliminar producto:', e)
  }
}
</script>

<style scoped>
.inventory-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.eyebrow {
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.page-header h1 {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  color: var(--text-title);
}

.filters-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  box-shadow: var(--shadow);
}

.filter-toggles {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-btn {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-body);
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: var(--bg-card);
  color: var(--text-title);
}

.filter-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.filter-btn.warning.active {
  background: #b12a2a;
  border-color: #b12a2a;
}

.inventory-summary {
  font-size: 0.9rem;
  color: var(--text-body);
}

.inventory-summary strong {
  color: var(--text-title);
}

/* Tabla */
.inventory-table-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.custom-table th {
  background: var(--bg-subtle);
  padding: 14px 18px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-title);
  border-bottom: 1px solid var(--border);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.custom-table td {
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
  vertical-align: middle;
}

.custom-table tbody tr:last-child td {
  border-bottom: none;
}

.custom-table tbody tr:hover {
  background-color: var(--bg-subtle);
}

.custom-table tbody tr.row-warning {
  background-color: rgba(217, 83, 79, 0.04);
}

.product-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sku-text {
  font-size: 0.78rem;
  color: var(--text-body);
}

.cat-pill {
  background: rgba(200, 157, 124, 0.12);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
}

.stock-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stock-badge {
  font-weight: 700;
  color: var(--text-title);
}

.stock-badge.low {
  color: #b12a2a;
}

.min-alert {
  font-size: 0.75rem;
  color: #b12a2a;
  font-weight: 600;
}

.price-text {
  color: var(--text-title);
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
}

.btn-step {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-title);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
}

.btn-step:hover {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.btn-icon {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
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
.empty-state {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
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
