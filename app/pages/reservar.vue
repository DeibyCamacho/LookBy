<template>
  <div class="booking-shell">
    <!-- Navbar Simple -->
    <header class="booking-header">
      <div class="header-container">
        <NuxtLink to="/" class="brand-logo">
          <span class="logo-emoji">🌸</span>
          <span class="logo-text">LookBy</span>
        </NuxtLink>

        <div class="header-actions">
          <ThemeToggle />
          <NuxtLink to="/" class="btn-secondary nav-btn">Volver al Inicio</NuxtLink>
        </div>
      </div>
    </header>

    <main class="booking-main">
      <div class="booking-card">
        <!-- Barra de Progreso de Pasos -->
        <div v-if="currentStep < 5" class="stepper-bar">
          <div :class="['step-indicator', { active: currentStep >= 1, current: currentStep === 1 }]">
            <span class="step-num">1</span>
            <span class="step-label">Servicio</span>
          </div>
          <div class="step-line" :class="{ filled: currentStep >= 2 }"></div>
          <div :class="['step-indicator', { active: currentStep >= 2, current: currentStep === 2 }]">
            <span class="step-num">2</span>
            <span class="step-label">Fecha y Hora</span>
          </div>
          <div class="step-line" :class="{ filled: currentStep >= 3 }"></div>
          <div :class="['step-indicator', { active: currentStep >= 3, current: currentStep === 3 }]">
            <span class="step-num">3</span>
            <span class="step-label">Tus Datos</span>
          </div>
          <div class="step-line" :class="{ filled: currentStep >= 4 }"></div>
          <div :class="['step-indicator', { active: currentStep >= 4, current: currentStep === 4 }]">
            <span class="step-num">4</span>
            <span class="step-label">Confirmación</span>
          </div>
        </div>

        <!-- PASO 1: Seleccionar Servicio -->
        <section v-if="currentStep === 1" class="step-content">
          <div class="step-heading">
            <h2>Selecciona el servicio que deseas</h2>
            <p>Elige uno de nuestros tratamientos profesionales.</p>
          </div>

          <!-- Filtro por Categorías -->
          <div class="category-pills">
            <button
              v-for="cat in categories"
              :key="cat"
              :class="['cat-btn', { active: selectedCategory === cat }]"
              @click="selectedCategory = cat"
            >
              {{ cat }}
            </button>
          </div>

          <div v-if="servicesPending" class="loading-box">Cargando servicios disponibles...</div>

          <div v-else-if="filteredServices.length === 0" class="empty-box">
            <p>No hay servicios disponibles en esta categoría.</p>
          </div>

          <div v-else class="services-selection-grid">
            <div
              v-for="s in filteredServices"
              :key="s._id"
              :class="['service-select-card', { selected: selectedService?._id === s._id }]"
              @click="selectService(s)"
            >
              <div class="card-info">
                <span class="service-cat">{{ s.category || 'General' }}</span>
                <h3>{{ s.name }}</h3>
                <p>{{ s.description || 'Tratamiento profesional.' }}</p>
              </div>

              <div class="card-pricing">
                <span class="duration">⏱️ {{ s.duration }} min</span>
                <strong class="price">${{ (s.price || 0).toLocaleString('es-CO') }}</strong>
              </div>
            </div>
          </div>

          <div class="step-nav-actions right">
            <button
              class="btn-primary btn-next"
              :disabled="!selectedService"
              @click="currentStep = 2"
            >
              Continuar a Horarios →
            </button>
          </div>
        </section>

        <!-- PASO 2: Fecha y Hora -->
        <section v-if="currentStep === 2" class="step-content">
          <div class="step-heading">
            <h2>Selecciona Fecha y Horario</h2>
            <p>Servicio: <strong>{{ selectedService?.name }}</strong> (${{ selectedService?.price?.toLocaleString('es-CO') }})</p>
          </div>

          <div class="date-time-picker">
            <div class="date-picker-box">
              <label>
                <span>📅 Elige el día de tu cita:</span>
                <input
                  v-model="selectedDate"
                  type="date"
                  :min="minDate"
                  class="input-field date-big-input"
                  @change="onDateChange"
                />
              </label>
            </div>

            <div class="slots-box">
              <span>⏰ Horarios Disponibles para el {{ formatDateHuman(selectedDate) }}:</span>
              <div class="slots-grid">
                <button
                  v-for="slot in availableTimeSlots"
                  :key="slot"
                  type="button"
                  :disabled="occupiedSlots.includes(slot)"
                  :class="['time-slot-btn', { active: selectedTime === slot, occupied: occupiedSlots.includes(slot) }]"
                  @click="!occupiedSlots.includes(slot) && (selectedTime = slot)"
                >
                  <span>{{ slot }}</span>
                  <small v-if="occupiedSlots.includes(slot)" class="occupied-tag">Ocupado</small>
                </button>
              </div>
            </div>
          </div>

          <div class="step-nav-actions">
            <button class="btn-secondary" @click="currentStep = 1">← Cambiar Servicio</button>
            <button
              class="btn-primary btn-next"
              :disabled="!selectedDate || !selectedTime"
              @click="currentStep = 3"
            >
              Ingresar Datos →
            </button>
          </div>
        </section>

        <!-- PASO 3: Datos de Contacto -->
        <section v-if="currentStep === 3" class="step-content">
          <div class="step-heading">
            <h2>Tus Datos de Contacto</h2>
            <p>Necesitamos tu información para confirmar tu cita.</p>
          </div>

          <form class="contact-form" @submit.prevent="currentStep = 4">
            <div class="form-row">
              <label>
                <span>Nombre Completo *</span>
                <input v-model="formData.name" class="input-field" placeholder="Tu nombre y apellido" required />
              </label>

              <label>
                <span>Teléfono / WhatsApp *</span>
                <input v-model="formData.phone" class="input-field" placeholder="Ej. 310 123 4567" required />
              </label>
            </div>

            <label>
              <span>Correo Electrónico (opcional)</span>
              <input v-model="formData.email" type="email" class="input-field" placeholder="tu@correo.com" />
            </label>

            <label>
              <span>Notas o Preferencias Especiales</span>
              <textarea
                v-model="formData.notes"
                class="input-field textarea"
                placeholder="Indícanos si tienes alguna preferencia o requerimiento especial..."
                rows="3"
              ></textarea>
            </label>

            <div class="step-nav-actions">
              <button type="button" class="btn-secondary" @click="currentStep = 2">← Cambiar Horario</button>
              <button
                type="submit"
                class="btn-primary btn-next"
                :disabled="!formData.name.trim() || !formData.phone.trim()"
              >
                Revisar Resumen →
              </button>
            </div>
          </form>
        </section>

        <!-- PASO 4: Resumen y Confirmación -->
        <section v-if="currentStep === 4" class="step-content">
          <div class="step-heading">
            <h2>Confirma tu Reserva</h2>
            <p>Revisa que todos los detalles sean correctos antes de agendar.</p>
          </div>

          <div class="summary-card">
            <div class="summary-item">
              <span class="summary-label">💇 Servicio Seleccionado:</span>
              <strong>{{ selectedService?.name }}</strong>
            </div>

            <div class="summary-item">
              <span class="summary-label">⏱️ Duración Estimada:</span>
              <span>{{ selectedService?.duration }} minutos</span>
            </div>

            <div class="summary-item">
              <span class="summary-label">📅 Fecha & Hora:</span>
              <strong>{{ formatDateHuman(selectedDate) }} a las {{ selectedTime }}</strong>
            </div>

            <div class="summary-item">
              <span class="summary-label">👤 Cliente:</span>
              <span>{{ formData.name }} ({{ formData.phone }})</span>
            </div>

            <div v-if="formData.notes" class="summary-item">
              <span class="summary-label">📝 Notas:</span>
              <span>{{ formData.notes }}</span>
            </div>

            <div class="summary-divider"></div>

            <div class="summary-total">
              <span>Total a Pagar en el Salón:</span>
              <strong class="total-price">${{ (selectedService?.price || 0).toLocaleString('es-CO') }}</strong>
            </div>
          </div>

          <div v-if="submitError" class="form-error">{{ submitError }}</div>

          <div class="step-nav-actions">
            <button class="btn-secondary" :disabled="submitting" @click="currentStep = 3">← Modificar Datos</button>
            <button
              class="btn-primary btn-confirm"
              :disabled="submitting"
              @click="submitBooking"
            >
              {{ submitting ? 'Confirmando Reserva...' : '✓ Confirmar y Agendar Cita' }}
            </button>
          </div>
        </section>

        <!-- PASO 5: Éxito y Ticket Digital -->
        <section v-if="currentStep === 5" class="step-content success-step">
          <div class="success-icon">🎉</div>
          <h2>¡Tu cita ha sido agendada con éxito!</h2>
          <p class="success-subtitle">Hemos reservado tu espacio en LookBy. Te esperamos con los brazos abiertos.</p>

          <div class="ticket-card">
            <div class="ticket-header">
              <span>Ticket de Cita Digital</span>
              <strong class="ticket-status">Estado: Pendiente</strong>
            </div>

            <div class="ticket-body">
              <div class="ticket-row">
                <span>Servicio:</span>
                <strong>{{ confirmedData?.serviceName }}</strong>
              </div>
              <div class="ticket-row">
                <span>Fecha y Hora:</span>
                <strong>{{ formatDateTimeFull(confirmedData?.dateTime) }}</strong>
              </div>
              <div class="ticket-row">
                <span>Cliente:</span>
                <span>{{ confirmedData?.clientName }}</span>
              </div>
              <div class="ticket-row">
                <span>Valor:</span>
                <strong class="ticket-price">${{ (confirmedData?.price || 0).toLocaleString('es-CO') }}</strong>
              </div>
            </div>
          </div>

          <div class="success-actions">
            <a
              :href="'https://wa.me/573000000000?text=' + encodeURIComponent('Hola LookBy, acabo de agendar una cita para ' + confirmedData?.serviceName + ' el ' + formatDateTimeFull(confirmedData?.dateTime))"
              target="_blank"
              class="btn-primary whatsapp-btn"
            >
              <span>💬 Enviar mensaje a WhatsApp</span>
            </a>
            <NuxtLink to="/" class="btn-secondary">Volver al Inicio</NuxtLink>
            <button class="btn-clear-date" @click="resetBooking">Agendar otra cita</button>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const currentStep = ref(1)
const selectedCategory = ref('Todas')
const categories = ['Todas', 'Peluquería', 'Barbería', 'Uñas', 'Facial', 'Corporal', 'Spa', 'General']

// Cargar servicios activos
const { data: servicesData, pending: servicesPending } = await useFetch<{ success: boolean; data: any[] }>('/api/services', {
  query: { active: 'true' }
})
const allServices = computed(() => servicesData.value?.data || [])

const filteredServices = computed(() => {
  if (selectedCategory.value === 'Todas') return allServices.value
  return allServices.value.filter((s) => s.category === selectedCategory.value)
})

const selectedService = ref<any>(null)

// Selección de servicio inicial si viene por query param
onMounted(() => {
  const queryServiceId = route.query.serviceId as string
  if (queryServiceId && allServices.value.length > 0) {
    const found = allServices.value.find((s) => s._id === queryServiceId)
    if (found) {
      selectedService.value = found
    }
  }

  // Prellenar si el usuario está autenticado
  if (authStore.user) {
    formData.name = authStore.user.name || ''
    formData.email = authStore.user.email || ''
    formData.phone = authStore.user.phone || ''
  }
})

const selectService = (service: any) => {
  selectedService.value = service
}

// Fecha y Horarios
const getTodayString = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

const minDate = ref(getTodayString())
const selectedDate = ref(getTodayString())
const selectedTime = ref('10:00')

const { data: occupiedData, refresh: refreshOccupied } = await useFetch<{ success: boolean; data: string[] }>('/api/appointments/occupied-slots', {
  query: computed(() => ({ date: selectedDate.value }))
})
const occupiedSlots = computed(() => occupiedData.value?.data || [])

const availableTimeSlots = [
  '08:00', '08:45', '09:30', '10:15', '11:00', '11:45',
  '12:30', '14:00', '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15'
]

const onDateChange = async () => {
  await refreshOccupied()
  if (occupiedSlots.value.includes(selectedTime.value)) {
    // Si la hora seleccionada está ocupada, buscar el primer horario libre
    const firstFree = availableTimeSlots.find((s) => !occupiedSlots.value.includes(s))
    selectedTime.value = firstFree || ''
  }
}

// Datos de Formulario
const formData = reactive({
  name: '',
  phone: '',
  email: '',
  notes: ''
})

// Envío de Cita
const submitting = ref(false)
const submitError = ref('')
const confirmedData = ref<any>(null)

const submitBooking = async () => {
  if (!selectedService.value || !selectedDate.value || !selectedTime.value) return

  submitError.value = ''
  submitting.value = true

  const [hours, minutes] = selectedTime.value.split(':').map(Number)
  const appointmentDate = new Date(selectedDate.value)
  appointmentDate.setHours(hours, minutes, 0, 0)

  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/appointments', {
      method: 'POST',
      body: {
        clientName: formData.name.trim(),
        clientPhone: formData.phone.trim(),
        clientEmail: formData.email.trim(),
        serviceId: selectedService.value._id,
        serviceName: selectedService.value.name,
        price: selectedService.value.price,
        duration: selectedService.value.duration,
        dateTime: appointmentDate.toISOString(),
        notes: formData.notes.trim()
      }
    })

    confirmedData.value = response.data
    currentStep.value = 5
  } catch (err: any) {
    submitError.value = err?.data?.statusMessage || err?.message || 'No se pudo programar la cita. Intenta de nuevo.'
  } finally {
    submitting.value = false
  }
}

const resetBooking = () => {
  currentStep.value = 1
  selectedService.value = null
  selectedDate.value = getTodayString()
  selectedTime.value = '10:00'
  formData.notes = ''
}

const formatDateHuman = (dStr: string) => {
  if (!dStr) return ''
  const d = new Date(dStr + 'T00:00:00')
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const formatDateTimeFull = (isoStr: string) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.booking-shell {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-body);
  display: flex;
  flex-direction: column;
}

/* Header */
.booking-header {
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 14px 20px;
}

.header-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.logo-emoji {
  font-size: 1.6rem;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-title);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  padding: 8px 14px;
  font-size: 0.85rem;
}

/* Main */
.booking-main {
  flex: 1;
  padding: 36px 20px 60px;
  display: flex;
  justify-content: center;
}

.booking-card {
  width: min(100%, 820px);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Stepper */
.stepper-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: all 0.2s ease;
}

.step-indicator.active {
  opacity: 1;
}

.step-indicator.current .step-num {
  background: var(--primary);
  color: #ffffff;
  box-shadow: 0 0 0 3px rgba(200, 157, 124, 0.25);
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-subtle);
  color: var(--text-title);
  font-weight: 700;
  font-size: 0.85rem;
  display: grid;
  place-items: center;
}

.step-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-title);
}

.step-line {
  flex: 1;
  height: 2px;
  background: var(--border);
  margin: 0 12px;
}

.step-line.filled {
  background: var(--primary);
}

/* Step Content */
.step-heading {
  margin-bottom: 20px;
}

.step-heading h2 {
  font-size: 1.45rem;
  color: var(--text-title);
  margin-bottom: 4px;
}

.step-heading p {
  font-size: 0.92rem;
  color: var(--text-body);
}

/* Categorías */
.category-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.cat-btn {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-body);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cat-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

/* Selección de Servicios */
.services-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 4px;
}

.service-select-card {
  background: var(--bg-subtle);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s ease;
}

.service-select-card:hover {
  background: var(--bg-card);
  border-color: var(--border);
  transform: translateY(-2px);
}

.service-select-card.selected {
  background: var(--bg-card);
  border-color: var(--primary);
  box-shadow: 0 4px 14px rgba(200, 157, 124, 0.2);
}

.service-cat {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  margin-bottom: 4px;
}

.card-info h3 {
  font-size: 1.05rem;
  color: var(--text-title);
  margin-bottom: 4px;
}

.card-info p {
  font-size: 0.82rem;
  color: var(--text-body);
  line-height: 1.4;
}

.card-pricing {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}

.duration {
  font-size: 0.78rem;
  color: var(--text-body);
}

.price {
  font-size: 1.15rem;
  color: var(--text-title);
}

/* Date & Time Picker */
.date-time-picker {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.date-picker-box label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-title);
}

.date-big-input {
  padding: 12px 16px;
  font-size: 1rem;
}

.slots-box span {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-title);
  margin-bottom: 12px;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
}

.time-slot-btn {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-title);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.time-slot-btn:hover:not(:disabled) {
  background: var(--bg-card);
  border-color: var(--primary);
}

.time-slot-btn.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.time-slot-btn.occupied {
  opacity: 0.5;
  background: rgba(182, 46, 46, 0.08);
  border-color: rgba(182, 46, 46, 0.2);
  cursor: not-allowed;
}

.occupied-tag {
  font-size: 0.65rem;
  color: #b12a2a;
  font-weight: 700;
  text-transform: uppercase;
}

/* Formulario Contacto */
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-form label {
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

/* Resumen / Confirmación */
.summary-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.summary-label {
  font-size: 0.88rem;
  color: var(--text-body);
}

.summary-divider {
  height: 1px;
  background: var(--border);
  margin: 6px 0;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.1rem;
}

.total-price {
  font-size: 1.5rem;
  color: var(--primary);
}

.form-error {
  background: rgba(182, 46, 46, 0.1);
  color: #b12a2a;
  border: 1px solid rgba(182, 46, 46, 0.25);
  border-radius: 10px;
  padding: 12px;
  font-size: 0.9rem;
}

/* Pantalla Éxito */
.success-step {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.success-icon {
  font-size: 3.5rem;
}

.success-subtitle {
  color: var(--text-body);
  max-width: 500px;
}

.ticket-card {
  width: min(100%, 480px);
  background: var(--bg-subtle);
  border: 2px dashed var(--primary);
  border-radius: 18px;
  padding: 24px;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 14px 0;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.ticket-status {
  color: #c48a14;
  font-size: 0.85rem;
}

.ticket-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.ticket-price {
  font-size: 1.2rem;
  color: var(--text-title);
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(100%, 360px);
}

.whatsapp-btn {
  background: #25D366;
  border-color: #25D366;
  text-decoration: none;
  justify-content: center;
}

.whatsapp-btn:hover {
  background: #1ebc57;
}

.btn-clear-date {
  background: transparent;
  border: none;
  color: var(--primary);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;
  font-size: 0.85rem;
}

/* Navegación entre pasos */
.step-nav-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  gap: 12px;
}

.step-nav-actions.right {
  justify-content: flex-end;
}

.btn-next,
.btn-confirm {
  padding: 12px 24px;
  font-size: 0.95rem;
}

.loading-box,
.empty-box {
  padding: 40px;
  text-align: center;
  color: var(--text-body);
}

@media (max-width: 600px) {
  .stepper-bar {
    overflow-x: auto;
  }

  .step-label {
    display: none;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .booking-card {
    padding: 24px 18px;
  }
}
</style>
