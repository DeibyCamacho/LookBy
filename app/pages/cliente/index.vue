<template>
  <div class="client-portal-shell">
    <!-- Navbar del Cliente -->
    <header class="client-navbar">
      <div class="navbar-container">
        <NuxtLink to="/cliente" class="brand-logo">
          <span class="logo-emoji">🌸</span>
          <span class="logo-text">LookBy</span>
          <span class="portal-badge">Portal Cliente</span>
        </NuxtLink>

        <div class="nav-actions">
          <ThemeToggle />
          <NuxtLink to="/reservar" class="btn-primary nav-btn">+ Agendar Cita</NuxtLink>
          <button class="btn-secondary nav-btn logout" @click="handleLogout">Cerrar Sesión</button>
        </div>
      </div>
    </header>

    <main class="client-content">
      <!-- Banner de Bienvenida -->
      <section class="welcome-card">
        <div class="welcome-info">
          <h2>¡Hola, {{ authStore.user?.name || 'Cliente' }}! ✨</h2>
          <p>Bienvenido a tu espacio personal. Aquí puedes consultar el estado de tus citas y reservar nuevos servicios.</p>
        </div>
        <div class="welcome-actions">
          <NuxtLink to="/reservar" class="btn-primary btn-big-book">
            <span>📅 Agendar Nueva Cita</span>
          </NuxtLink>
        </div>
      </section>

      <!-- Grid de Citas -->
      <section class="appointments-section">
        <div class="section-top">
          <h3>Mis Citas y Reservas</h3>
          <button class="btn-refresh" :disabled="pending" @click="() => refresh()">
            🔄 {{ pending ? 'Actualizando...' : 'Refrescar' }}
          </button>
        </div>

        <div v-if="pending" class="loading-state">Cargando tus citas...</div>

        <div v-else-if="!appointments || appointments.length === 0" class="empty-card">
          <span class="empty-icon">📅</span>
          <h3>Aún no tienes citas agendadas</h3>
          <p>Explora nuestros servicios de peluquería, estética y cuidado personal.</p>
          <NuxtLink to="/reservar" class="btn-primary" style="margin-top: 16px;">Ver Servicios y Agendar</NuxtLink>
        </div>

        <div v-else class="appointments-cards-grid">
          <article
            v-for="app in appointments"
            :key="app._id"
            :class="['app-card', app.status]"
          >
            <div class="app-card-header">
              <div>
                <span class="service-pill">💇 Tratamiento</span>
                <h4>{{ app.serviceName }}</h4>
              </div>
              <span :class="['status-badge', app.status]">{{ app.status }}</span>
            </div>

            <div class="app-card-body">
              <div class="info-line">
                <span>⏰ Fecha y Hora:</span>
                <strong>{{ formatDateTime(app.dateTime) }}</strong>
              </div>
              <div class="info-line">
                <span>⏱️ Duración:</span>
                <span>{{ app.duration || 30 }} minutos</span>
              </div>
              <div class="info-line">
                <span>💰 Total a pagar:</span>
                <strong class="price-highlight">${{ (app.price || 0).toLocaleString('es-CO') }}</strong>
              </div>
              <div v-if="app.notes" class="info-line notes">
                <span>📝 Observaciones:</span>
                <p>{{ app.notes }}</p>
              </div>
            </div>

            <div class="app-card-footer">
              <span v-if="app.status === 'pendiente'" class="hint-text">
                ⏳ Tu cita está pendiente de confirmación por el salón.
              </span>
              <span v-else-if="app.status === 'confirmada'" class="hint-text confirmed">
                ✅ ¡Cita confirmada! Te esperamos a la hora programada.
              </span>
              <span v-else-if="app.status === 'completada'" class="hint-text completed">
                ⭐ Servicio completado. ¡Gracias por tu visita!
              </span>
              <span v-else class="hint-text cancelled">
                ❌ Esta cita ha sido cancelada.
              </span>

              <button
                v-if="app.status === 'pendiente'"
                class="btn-cancel-app"
                :disabled="cancellingId === app._id"
                @click="cancelAppointment(app._id)"
              >
                {{ cancellingId === app._id ? 'Cancelando...' : 'Cancelar Cita' }}
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- Perfil del Cliente -->
      <section class="profile-card">
        <h3>Tu Perfil de Cliente</h3>
        <div class="profile-grid">
          <div class="profile-item">
            <span>Nombre:</span>
            <strong>{{ authStore.user?.name }}</strong>
          </div>
          <div class="profile-item">
            <span>Correo Electrónico:</span>
            <strong>{{ authStore.user?.email }}</strong>
          </div>
          <div class="profile-item">
            <span>Teléfono / WhatsApp:</span>
            <strong>{{ authStore.user?.phone || 'No registrado' }}</strong>
          </div>
          <div class="profile-item">
            <span>Tipo de Cuenta:</span>
            <span class="role-chip">Cliente LookBy</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

definePageMeta({
  middleware: ['admin-auth']
})

const authStore = useAuthStore()

// Cargar las citas del cliente
const { data, pending, refresh } = await useFetch<{ success: boolean; data: any[] }>('/api/client/my-appointments')
const appointments = computed(() => data.value?.data || [])

const cancellingId = ref('')

const cancelAppointment = async (id: string) => {
  if (!confirm('¿Deseas cancelar esta cita?')) return

  cancellingId.value = id
  try {
    await $fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      body: { status: 'cancelada' }
    })
    await refresh()
  } catch (e) {
    console.error('Error al cancelar cita:', e)
  } finally {
    cancellingId.value = ''
  }
}

const handleLogout = async () => {
  await authStore.logout()
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.client-portal-shell {
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-body);
  display: flex;
  flex-direction: column;
}

/* Navbar */
.client-navbar {
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-container {
  max-width: 1100px;
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

/* Content */
.client-content {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Welcome Card */
.welcome-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 28px;
  box-shadow: var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.welcome-info h2 {
  font-size: 1.5rem;
  color: var(--text-title);
  margin-bottom: 6px;
}

.welcome-info p {
  color: var(--text-body);
  font-size: 0.95rem;
  max-width: 580px;
  line-height: 1.5;
}

.btn-big-book {
  padding: 14px 26px;
  font-size: 1rem;
  text-decoration: none;
}

/* Sección de Citas */
.appointments-section {
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

.appointments-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.app-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 22px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-left: 5px solid var(--primary);
}

.app-card.confirmada {
  border-left-color: #3b71ca;
}

.app-card.completada {
  border-left-color: var(--accent);
}

.app-card.cancelada {
  border-left-color: #b12a2a;
  opacity: 0.7;
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.service-pill {
  font-size: 0.72rem;
  color: var(--primary);
  font-weight: 700;
  text-transform: uppercase;
}

.app-card-header h4 {
  font-size: 1.15rem;
  color: var(--text-title);
  margin-top: 2px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.pendiente {
  background: rgba(220, 160, 50, 0.15);
  color: #c48a14;
}

.status-badge.confirmada {
  background: rgba(100, 140, 220, 0.15);
  color: #3b71ca;
}

.status-badge.completada {
  background: rgba(138, 154, 134, 0.2);
  color: var(--accent);
}

.status-badge.cancelada {
  background: rgba(182, 46, 46, 0.12);
  color: #b12a2a;
}

.app-card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.88rem;
}

.info-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-line span {
  color: var(--text-body);
}

.price-highlight {
  color: var(--primary);
  font-size: 1.1rem;
}

.info-line.notes {
  flex-direction: column;
  align-items: flex-start;
  background: var(--bg-subtle);
  padding: 8px 10px;
  border-radius: 8px;
}

.app-card-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.hint-text {
  font-size: 0.8rem;
  color: var(--text-body);
}

.hint-text.confirmed {
  color: #3b71ca;
  font-weight: 600;
}

.hint-text.completed {
  color: var(--accent);
  font-weight: 600;
}

.btn-cancel-app {
  background: transparent;
  border: 1px solid #b12a2a;
  color: #b12a2a;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
  transition: all 0.2s ease;
}

.btn-cancel-app:hover {
  background: rgba(182, 46, 46, 0.1);
}

/* Perfil Card */
.profile-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px 28px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.profile-card h3 {
  font-size: 1.2rem;
  color: var(--text-title);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.profile-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-item span {
  font-size: 0.8rem;
  color: var(--text-body);
}

.profile-item strong {
  font-size: 0.95rem;
  color: var(--text-title);
}

.role-chip {
  display: inline-block;
  background: rgba(138, 154, 134, 0.15);
  color: var(--accent);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  width: fit-content;
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
</style>
