<template>
  <div class="appointments-page">
    <div class="page-header">
      <div>
        <p class="eyebrow">Gestión de Agenda</p>
        <h1>Citas y Reservas</h1>
      </div>
      <button class="btn-primary" @click="openCreateModal">+ Nueva Cita</button>
    </div>

    <!-- Barra de Filtros -->
    <div class="filters-bar">
      <div class="status-filters">
        <button
          v-for="s in statusOptions"
          :key="s.value"
          :class="['filter-btn', { active: selectedStatus === s.value }]"
          @click="selectedStatus = s.value"
        >
          {{ s.label }}
        </button>
      </div>

      <div class="date-filter">
        <label>
          <span>Filtrar por fecha:</span>
          <input v-model="selectedDate" type="date" class="input-field date-input" />
        </label>
        <button v-if="selectedDate" class="btn-clear-date" @click="selectedDate = ''">Limpiar fecha</button>
      </div>
    </div>

    <!-- Lista de Citas -->
    <div v-if="pending" class="loading-state">Cargando agenda de citas...</div>

    <div v-else-if="!appointments || appointments.length === 0" class="empty-state">
      <span class="empty-icon">📅</span>
      <h3>No hay citas para los filtros seleccionados</h3>
      <p>Puedes programar una nueva cita con el botón superior.</p>
      <button class="btn-primary" style="margin-top: 14px;" @click="openCreateModal">Programar Cita</button>
    </div>

    <div v-else class="appointments-grid">
      <article
        v-for="app in appointments"
        :key="app._id"
        :class="['appointment-card', app.status]"
      >
        <div class="card-top">
          <div class="client-heading">
            <h3>{{ app.clientName }}</h3>
            <a :href="'tel:' + app.clientPhone" class="client-phone">📞 {{ app.clientPhone }}</a>
          </div>
          <span :class="['status-pill', app.status]">{{ app.status }}</span>
        </div>

        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">💇 Servicio:</span>
            <strong>{{ app.serviceName }}</strong>
          </div>
          <div class="detail-row">
            <span class="detail-label">⏰ Fecha y Hora:</span>
            <span>{{ formatDateTime(app.dateTime) }} ({{ app.duration }} min)</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">💰 Precio:</span>
            <strong class="price-tag">${{ (app.price || 0).toLocaleString('es-CO') }}</strong>
          </div>
          <div v-if="app.notes" class="detail-row notes">
            <span class="detail-label">📝 Notas:</span>
            <p>{{ app.notes }}</p>
          </div>
        </div>

        <div class="card-actions">
          <button
            v-if="app.status === 'pendiente'"
            class="btn-action confirm"
            :disabled="actionLoading === app._id"
            @click="updateStatus(app._id, 'confirmada')"
          >
            ✓ Confirmar
          </button>

          <button
            v-if="app.status !== 'completada' && app.status !== 'cancelada'"
            class="btn-action complete"
            :disabled="actionLoading === app._id"
            @click="updateStatus(app._id, 'completada')"
          >
            ★ Completar
          </button>

          <button
            v-if="app.status !== 'cancelada'"
            class="btn-action cancel"
            :disabled="actionLoading === app._id"
            @click="updateStatus(app._id, 'cancelada')"
          >
            ✕ Cancelar
          </button>

          <button
            class="btn-action delete"
            :disabled="actionLoading === app._id"
            title="Eliminar registro"
            @click="deleteAppointment(app._id)"
          >
            🗑️
          </button>
        </div>
      </article>
    </div>

    <!-- Modal de Nueva Cita -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Agendar Nueva Cita</h2>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="handleCreateAppointment">
          <div class="form-row">
            <label>
              <span>Nombre del Cliente *</span>
              <input v-model="form.clientName" class="input-field" placeholder="Ej. Mariana López" required />
            </label>

            <label>
              <span>Teléfono / WhatsApp *</span>
              <input v-model="form.clientPhone" class="input-field" placeholder="Ej. 310 123 4567" required />
            </label>
          </div>

          <label>
            <span>Seleccionar Servicio *</span>
            <select v-model="form.serviceId" class="input-field" required @change="onServiceSelected">
              <option value="" disabled>Selecciona un servicio...</option>
              <option v-for="s in services" :key="s._id" :value="s._id">
                {{ s.name }} — ${{ s.price?.toLocaleString('es-CO') }} ({{ s.duration }} min)
              </option>
            </select>
          </label>

          <div class="form-row">
            <label>
              <span>Fecha y Hora de Inicio *</span>
              <input v-model="form.dateTime" type="datetime-local" class="input-field" required />
            </label>

            <label>
              <span>Duración (minutos)</span>
              <input v-model.number="form.duration" type="number" min="5" step="5" class="input-field" required />
            </label>
          </div>

          <div class="form-row">
            <label>
              <span>Precio Cobrado ($)</span>
              <input v-model.number="form.price" type="number" min="0" class="input-field" required />
            </label>

            <label>
              <span>Notas adicionales</span>
              <input v-model="form.notes" class="input-field" placeholder="Preferencias, color, etc." />
            </label>
          </div>

          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="formSubmitting">
              {{ formSubmitting ? 'Guardando...' : 'Agendar Cita' }}
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

const selectedStatus = ref('')
const selectedDate = ref('')
const actionLoading = ref('')

const statusOptions = [
  { label: 'Todas', value: '' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Confirmadas', value: 'confirmada' },
  { label: 'Completadas', value: 'completada' },
  { label: 'Canceladas', value: 'cancelada' }
]

// Query reactiva para citas
const queryParams = computed(() => {
  const params: any = {}
  if (selectedStatus.value) params.status = selectedStatus.value
  if (selectedDate.value) params.date = selectedDate.value
  return params
})

const { data, pending, refresh } = await useFetch<{ success: boolean; data: any[] }>('/api/appointments', {
  query: queryParams
})

const appointments = computed(() => data.value?.data || [])

// Cargar catálogo de servicios para el selector
const { data: servicesData } = await useFetch<{ success: boolean; data: any[] }>('/api/services', {
  query: { active: 'true' }
})
const services = computed(() => servicesData.value?.data || [])

// Estado del Modal
const showModal = ref(false)
const formSubmitting = ref(false)
const formError = ref('')

const form = reactive({
  clientName: '',
  clientPhone: '',
  serviceId: '',
  serviceName: '',
  price: 0,
  duration: 30,
  dateTime: '',
  notes: ''
})

const openCreateModal = () => {
  formError.value = ''
  form.clientName = ''
  form.clientPhone = ''
  form.serviceId = services.value[0]?._id || ''
  if (services.value[0]) {
    form.serviceName = services.value[0].name
    form.price = services.value[0].price
    form.duration = services.value[0].duration
  }

  // Prellenar fecha con la siguiente hora
  const now = new Date()
  now.setMinutes(0, 0, 0)
  now.setHours(now.getHours() + 1)
  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  form.dateTime = localIso
  form.notes = ''
  showModal.value = true
}

const onServiceSelected = () => {
  const s = services.value.find((item) => item._id === form.serviceId)
  if (s) {
    form.serviceName = s.name
    form.price = s.price
    form.duration = s.duration
  }
}

const handleCreateAppointment = async () => {
  formError.value = ''
  formSubmitting.value = true

  try {
    await $fetch('/api/appointments', {
      method: 'POST',
      body: {
        clientName: form.clientName.trim(),
        clientPhone: form.clientPhone.trim(),
        serviceId: form.serviceId,
        serviceName: form.serviceName,
        price: form.price,
        duration: form.duration,
        dateTime: new Date(form.dateTime).toISOString(),
        notes: form.notes.trim()
      }
    })

    showModal.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err?.data?.statusMessage || err?.message || 'Error al guardar cita.'
  } finally {
    formSubmitting.value = false
  }
}

const updateStatus = async (id: string, status: string) => {
  actionLoading.value = id
  try {
    await $fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      body: { status }
    })
    await refresh()
  } catch (e) {
    console.error('Error al actualizar estado:', e)
  } finally {
    actionLoading.value = ''
  }
}

const deleteAppointment = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar esta cita?')) return
  actionLoading.value = id
  try {
    await $fetch(`/api/appointments/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e) {
    console.error('Error al eliminar cita:', e)
  } finally {
    actionLoading.value = ''
  }
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.appointments-page {
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

/* Filtros */
.filters-bar {
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

.status-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-btn {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-body);
  padding: 8px 14px;
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

.date-filter {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-filter label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-title);
}

.date-input {
  padding: 6px 10px;
  font-size: 0.85rem;
  width: auto;
}

.btn-clear-date {
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
}

/* Grid de Citas */
.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.appointment-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-left: 5px solid var(--primary);
  transition: transform 0.2s ease;
}

.appointment-card:hover {
  transform: translateY(-2px);
}

.appointment-card.confirmada {
  border-left-color: #3b71ca;
}

.appointment-card.completada {
  border-left-color: var(--accent);
}

.appointment-card.cancelada {
  border-left-color: #b12a2a;
  opacity: 0.75;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.client-heading h3 {
  font-size: 1.15rem;
  color: var(--text-title);
  margin-bottom: 2px;
}

.client-phone {
  font-size: 0.82rem;
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.status-pill {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-pill.pendiente {
  background: rgba(220, 160, 50, 0.15);
  color: #c48a14;
}

.status-pill.confirmada {
  background: rgba(100, 140, 220, 0.15);
  color: #3b71ca;
}

.status-pill.completada {
  background: rgba(138, 154, 134, 0.2);
  color: var(--accent);
}

.status-pill.cancelada {
  background: rgba(182, 46, 46, 0.12);
  color: #b12a2a;
}

.card-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.detail-label {
  color: var(--text-body);
  font-size: 0.82rem;
}

.price-tag {
  color: var(--text-title);
  font-size: 1.05rem;
}

.detail-row.notes {
  flex-direction: column;
  align-items: flex-start;
  background: var(--bg-subtle);
  padding: 8px 10px;
  border-radius: 8px;
}

.detail-row.notes p {
  font-size: 0.82rem;
  color: var(--text-title);
}

/* Acciones en Tarjeta */
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.btn-action {
  flex: 1;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg-subtle);
  color: var(--text-title);
  transition: all 0.2s ease;
}

.btn-action.confirm:hover {
  background: #3b71ca;
  color: #ffffff;
  border-color: #3b71ca;
}

.btn-action.complete:hover {
  background: var(--accent);
  color: #ffffff;
  border-color: var(--accent);
}

.btn-action.cancel:hover {
  background: #b12a2a;
  color: #ffffff;
  border-color: #b12a2a;
}

.btn-action.delete {
  flex: 0 0 auto;
  padding: 8px 10px;
}

.btn-action.delete:hover {
  background: rgba(182, 46, 46, 0.15);
  border-color: #b12a2a;
}

/* Estados Vacíos y de Carga */
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
  width: min(100%, 540px);
  padding: 28px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: 90vh;
  overflow-y: auto;
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

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
