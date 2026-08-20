<template>
  <div class="services-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Catálogo</p>
        <h1>Servicios del Salón</h1>
      </div>
      <button class="btn-primary" @click="openCreateModal">+ Nuevo Servicio</button>
    </div>

    <!-- Filtro por Categorías -->
    <div class="categories-bar">
      <button
        v-for="cat in categoryList"
        :key="cat"
        :class="['cat-btn', { active: selectedCategory === cat }]"
        @click="selectedCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- Lista / Grid de Servicios -->
    <div v-if="pending" class="loading-state">Cargando catálogo de servicios...</div>

    <div v-else-if="!services || services.length === 0" class="empty-state">
      <span class="empty-icon">💇</span>
      <h3>No hay servicios registrados en esta categoría</h3>
      <p>Agrega los servicios y tratamientos que ofrece tu negocio.</p>
      <button class="btn-primary" style="margin-top: 14px;" @click="openCreateModal">Agregar Primer Servicio</button>
    </div>

    <div v-else class="services-grid">
      <article
        v-for="s in services"
        :key="s._id"
        :class="['service-card', { inactive: !s.active }]"
      >
        <div class="service-top">
          <span class="category-badge">{{ s.category || 'General' }}</span>
          <button
            :class="['active-toggle', { on: s.active }]"
            :title="s.active ? 'Desactivar servicio' : 'Activar servicio'"
            @click="toggleActive(s)"
          >
            {{ s.active ? '● Activo' : '○ Inactivo' }}
          </button>
        </div>

        <div class="service-body">
          <h3>{{ s.name }}</h3>
          <p class="service-desc">{{ s.description || 'Sin descripción adicional.' }}</p>
        </div>

        <div class="service-footer">
          <div class="service-meta">
            <span class="service-duration">⏱️ {{ s.duration }} min</span>
            <strong class="service-price">${{ (s.price || 0).toLocaleString('es-CO') }}</strong>
          </div>

          <div class="service-actions">
            <button class="btn-icon" title="Editar servicio" @click="openEditModal(s)">✏️</button>
            <button class="btn-icon delete" title="Eliminar servicio" @click="deleteService(s._id)">🗑️</button>
          </div>
        </div>
      </article>
    </div>

    <!-- Modal de Crear / Editar Servicio -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ editingId ? 'Editar Servicio' : 'Nuevo Servicio' }}</h2>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="handleSaveService">
          <label>
            <span>Nombre del Servicio *</span>
            <input v-model="form.name" class="input-field" placeholder="Ej. Corte y Peinado Dama" required />
          </label>

          <div class="form-row">
            <label>
              <span>Categoría</span>
              <select v-model="form.category" class="input-field" required>
                <option v-for="cat in standardCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </label>

            <label>
              <span>Precio ($) *</span>
              <input v-model.number="form.price" type="number" min="0" class="input-field" required />
            </label>
          </div>

          <div class="form-row">
            <label>
              <span>Duración estimada (minutos) *</span>
              <input v-model.number="form.duration" type="number" min="5" step="5" class="input-field" required />
            </label>

            <label>
              <span>Estado</span>
              <select v-model="form.active" class="input-field">
                <option :value="true">Activo (Visible)</option>
                <option :value="false">Inactivo (Oculto)</option>
              </select>
            </label>
          </div>

          <label>
            <span>Descripción breve</span>
            <textarea
              v-model="form.description"
              class="input-field textarea"
              placeholder="Detalles sobre lo que incluye el servicio..."
              rows="3"
            ></textarea>
          </label>

          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="formSubmitting">
              {{ formSubmitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Servicio') }}
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

const selectedCategory = ref('Todas')
const standardCategories = ['Peluquería', 'Barbería', 'Uñas', 'Facial', 'Corporal', 'Maquillaje', 'Spa', 'General']
const categoryList = ['Todas', ...standardCategories]

const queryParams = computed(() => {
  return selectedCategory.value !== 'Todas' ? { category: selectedCategory.value } : {}
})

const { data, pending, refresh } = await useFetch<{ success: boolean; data: any[] }>('/api/services', {
  query: queryParams
})

const services = computed(() => data.value?.data || [])

// Modal Estado
const showModal = ref(false)
const editingId = ref<string | null>(null)
const formSubmitting = ref(false)
const formError = ref('')

const form = reactive({
  name: '',
  category: 'Peluquería',
  price: 25000,
  duration: 45,
  description: '',
  active: true
})

const openCreateModal = () => {
  editingId.value = null
  formError.value = ''
  form.name = ''
  form.category = 'Peluquería'
  form.price = 25000
  form.duration = 45
  form.description = ''
  form.active = true
  showModal.value = true
}

const openEditModal = (service: any) => {
  editingId.value = service._id
  formError.value = ''
  form.name = service.name || ''
  form.category = service.category || 'General'
  form.price = service.price || 0
  form.duration = service.duration || 30
  form.description = service.description || ''
  form.active = service.active !== false
  showModal.value = true
}

const handleSaveService = async () => {
  formError.value = ''
  formSubmitting.value = true

  try {
    if (editingId.value) {
      await $fetch(`/api/services/${editingId.value}`, {
        method: 'PUT',
        body: form
      })
    } else {
      await $fetch('/api/services', {
        method: 'POST',
        body: form
      })
    }

    showModal.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || err?.message || 'Error al guardar servicio.'
  } finally {
    formSubmitting.value = false
  }
}

const toggleActive = async (service: any) => {
  try {
    await $fetch(`/api/services/${service._id}`, {
      method: 'PUT',
      body: { active: !service.active }
    })
    await refresh()
  } catch (e) {
    console.error('Error al cambiar estado activo:', e)
  }
}

const deleteService = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar este servicio del catálogo?')) return

  try {
    await $fetch(`/api/services/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    console.error('Error al eliminar servicio:', e)
  }
}
</script>

<style scoped>
.services-page {
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

/* Categorías */
.categories-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-body);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.2s ease;
}

.cat-btn:hover {
  background: var(--bg-subtle);
  color: var(--text-title);
}

.cat-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

/* Grid de Servicios */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.service-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 22px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.service-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.service-card.inactive {
  opacity: 0.6;
}

.service-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-badge {
  background: rgba(200, 157, 124, 0.15);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.75rem;
}

.active-toggle {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-body);
  cursor: pointer;
}

.active-toggle.on {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(138, 154, 134, 0.1);
}

.service-body h3 {
  font-size: 1.2rem;
  color: var(--text-title);
  margin-bottom: 6px;
}

.service-desc {
  color: var(--text-body);
  font-size: 0.86rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid var(--border);
}

.service-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.service-duration {
  font-size: 0.78rem;
  color: var(--text-body);
}

.service-price {
  font-size: 1.2rem;
  color: var(--text-title);
}

.service-actions {
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

.textarea {
  resize: vertical;
  min-height: 80px;
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
