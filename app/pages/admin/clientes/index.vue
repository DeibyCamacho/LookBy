<template>
  <div class="clients-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Directorio</p>
        <h1>Gestión de Clientes</h1>
      </div>
      <button class="btn-primary" @click="openCreateModal">+ Nuevo Cliente</button>
    </div>

    <!-- Barra de Búsqueda -->
    <div class="search-bar-card">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          class="input-field search-input"
          placeholder="Buscar cliente por nombre, teléfono o correo..."
          @input="onSearchInput"
        />
        <button v-if="searchQuery" class="btn-clear" @click="clearSearch">✕</button>
      </div>
      <span class="clients-count">{{ clients.length }} cliente(s) registrado(s)</span>
    </div>

    <!-- Lista / Tabla de Clientes -->
    <div v-if="pending" class="loading-state">Cargando directorio de clientes...</div>

    <div v-else-if="!clients || clients.length === 0" class="empty-state">
      <span class="empty-icon">👥</span>
      <h3>No se encontraron clientes</h3>
      <p v-if="searchQuery">No hay resultados para "{{ searchQuery }}".</p>
      <p v-else>Comienza registrando tu primer cliente.</p>
      <button class="btn-primary" style="margin-top: 14px;" @click="openCreateModal">Registrar Cliente</button>
    </div>

    <div v-else class="clients-table-card">
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Contacto</th>
              <th>Visitas</th>
              <th>Notas / Preferencias</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in clients" :key="c._id">
              <td>
                <div class="client-cell">
                  <div class="avatar">{{ c.name?.charAt(0).toUpperCase() }}</div>
                  <strong>{{ c.name }}</strong>
                </div>
              </td>
              <td>
                <div class="contact-cell">
                  <a :href="'tel:' + c.phone" class="phone-link">📞 {{ c.phone }}</a>
                  <small v-if="c.email" class="email-text">✉️ {{ c.email }}</small>
                </div>
              </td>
              <td>
                <span class="visits-badge">{{ c.totalVisits || 0 }} citas</span>
              </td>
              <td>
                <p class="notes-text">{{ c.notes || '—' }}</p>
              </td>
              <td style="text-align: right;">
                <div class="row-actions">
                  <button class="btn-icon" title="Editar cliente" @click="openEditModal(c)">✏️</button>
                  <button class="btn-icon delete" title="Eliminar cliente" @click="deleteClient(c._id)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal de Crear / Editar Cliente -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>{{ editingId ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}</h2>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="handleSaveClient">
          <label>
            <span>Nombre Completo *</span>
            <input v-model="form.name" class="input-field" placeholder="Ej. Carlos Mendoza" required />
          </label>

          <div class="form-row">
            <label>
              <span>Teléfono / WhatsApp *</span>
              <input v-model="form.phone" class="input-field" placeholder="Ej. 320 456 7890" required />
            </label>

            <label>
              <span>Correo Electrónico</span>
              <input v-model="form.email" type="email" class="input-field" placeholder="cliente@correo.com" />
            </label>
          </div>

          <label>
            <span>Notas o Preferencias</span>
            <textarea
              v-model="form.notes"
              class="input-field textarea"
              placeholder="Alergias, estilos favoritos, observaciones..."
              rows="3"
            ></textarea>
          </label>

          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="formSubmitting">
              {{ formSubmitting ? 'Guardando...' : (editingId ? 'Actualizar Cliente' : 'Guardar Cliente') }}
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

const searchQuery = ref('')
const activeSearch = ref('')

const queryParams = computed(() => {
  return activeSearch.value ? { q: activeSearch.value } : {}
})

const { data, pending, refresh } = await useFetch<{ success: boolean; data: any[] }>('/api/clients', {
  query: queryParams
})

const clients = computed(() => data.value?.data || [])

let debounceTimeout: any = null
const onSearchInput = () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    activeSearch.value = searchQuery.value.trim()
  }, 300)
}

const clearSearch = () => {
  searchQuery.value = ''
  activeSearch.value = ''
}

// Modal Estado
const showModal = ref(false)
const editingId = ref<string | null>(null)
const formSubmitting = ref(false)
const formError = ref('')

const form = reactive({
  name: '',
  phone: '',
  email: '',
  notes: ''
})

const openCreateModal = () => {
  editingId.value = null
  formError.value = ''
  form.name = ''
  form.phone = ''
  form.email = ''
  form.notes = ''
  showModal.value = true
}

const openEditModal = (client: any) => {
  editingId.value = client._id
  formError.value = ''
  form.name = client.name || ''
  form.phone = client.phone || ''
  form.email = client.email || ''
  form.notes = client.notes || ''
  showModal.value = true
}

const handleSaveClient = async () => {
  formError.value = ''
  formSubmitting.value = true

  try {
    if (editingId.value) {
      await $fetch(`/api/clients/${editingId.value}`, {
        method: 'PUT',
        body: form
      })
    } else {
      await $fetch('/api/clients', {
        method: 'POST',
        body: form
      })
    }

    showModal.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || err?.message || 'Error al guardar cliente.'
  } finally {
    formSubmitting.value = false
  }
}

const deleteClient = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar este cliente?')) return

  try {
    await $fetch(`/api/clients/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    console.error('Error al eliminar cliente:', e)
  }
}
</script>

<style scoped>
.clients-page {
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

.search-bar-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow);
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
}

.search-input {
  padding-left: 40px;
  padding-right: 36px;
}

.btn-clear {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-body);
  cursor: pointer;
  font-size: 0.9rem;
}

.clients-count {
  font-size: 0.85rem;
  color: var(--text-body);
  font-weight: 600;
}

/* Tabla */
.clients-table-card {
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

.client-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(200, 157, 124, 0.2);
  color: var(--primary);
  display: grid;
  place-items: center;
  font-weight: 700;
}

.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.phone-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.email-text {
  color: var(--text-body);
  font-size: 0.8rem;
}

.visits-badge {
  background: rgba(138, 154, 134, 0.15);
  color: var(--accent);
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.78rem;
}

.notes-text {
  max-width: 280px;
  color: var(--text-body);
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-actions {
  display: flex;
  justify-content: flex-end;
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
