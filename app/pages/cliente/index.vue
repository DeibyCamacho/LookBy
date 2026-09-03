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
          <NuxtLink to="/" class="btn-secondary nav-btn">🌐 Ver Catálogo</NuxtLink>
          <NuxtLink to="/reservar" class="btn-primary nav-btn">+ Agendar Cita</NuxtLink>
          <button class="btn-secondary nav-btn logout" @click="handleLogout">🚪 Cerrar Sesión</button>
        </div>
      </div>
    </header>

    <main class="client-content">
      <!-- Banner de Bienvenida -->
      <section class="welcome-card">
        <div class="welcome-info">
          <h2>¡Hola, {{ authStore.user?.nombre || authStore.user?.name || 'Cliente' }}! ✨</h2>
          <p>Bienvenido a tu portal personal LookBy. Administra tus pedidos de productos, citas y datos de contacto.</p>
        </div>
        <div class="welcome-actions">
          <NuxtLink to="/reservar" class="btn-primary btn-big-book">
            <span>📅 Agendar Cita</span>
          </NuxtLink>
          <NuxtLink to="/#catalogo" class="btn-secondary btn-big-book">
            <span>🛒 Comprar Productos</span>
          </NuxtLink>
        </div>
      </section>

      <!-- Selector de Pestañas Principales -->
      <div class="portal-tabs-nav">
        <button
          :class="['portal-tab-btn', { active: activeTab === 'pedidos' }]"
          @click="activeTab = 'pedidos'"
        >
          📦 Mis Pedidos (PEDIDO)
        </button>
        <button
          :class="['portal-tab-btn', { active: activeTab === 'citas' }]"
          @click="activeTab = 'citas'"
        >
          📅 Mis Citas y Reservas
        </button>
        <button
          :class="['portal-tab-btn', { active: activeTab === 'perfil' }]"
          @click="activeTab = 'perfil'"
        >
          👤 Mi Perfil (USUARIO)
        </button>
      </div>

      <!-- Pestaña 1: Mis Pedidos (PEDIDO & DET_PEDIDO) -->
      <section v-if="activeTab === 'pedidos'" class="portal-section">
        <div class="section-top">
          <div>
            <h3>Historial de Pedidos Realizados</h3>
            <p>Monitorea el estado y desglose de tus compras de productos de belleza.</p>
          </div>
          <button class="btn-refresh" :disabled="pendingOrders" @click="() => refreshOrders()">
            🔄 {{ pendingOrders ? 'Cargando...' : 'Actualizar Pedidos' }}
          </button>
        </div>

        <div v-if="pendingOrders" class="loading-state">Cargando tus pedidos...</div>

        <div v-else-if="!orders || orders.length === 0" class="empty-card">
          <span class="empty-icon">🛒</span>
          <h3>Aún no has generado pedidos</h3>
          <p>Explora el catálogo de productos capilares y tratamientos disponibles.</p>
          <NuxtLink to="/#catalogo" class="btn-primary" style="margin-top: 14px;">Explorar Productos</NuxtLink>
        </div>

        <div v-else class="orders-list">
          <article v-for="ord in orders" :key="ord._id" class="order-card">
            <div class="order-header-row">
              <div class="order-id-meta">
                <span class="order-badge">PEDIDO #{{ String(ord._id).substring(18) }}</span>
                <span class="order-date">📅 {{ formatDate(ord.fecha) }}</span>
              </div>
              <span :class="['status-pill', ord.estado.toLowerCase().replace(' ', '-')]">
                {{ ord.estado }}
              </span>
            </div>

            <div class="order-items-table">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="det in ord.detalles" :key="det._id">
                    <td>
                      <div class="product-cell">
                        <img :src="det.idProducto?.imagen || defaultProdImg" class="mini-thumb" />
                        <div>
                          <strong>{{ det.idProducto?.nombre || 'Producto' }}</strong>
                          <small>{{ det.idProducto?.categoria || 'General' }}</small>
                        </div>
                      </div>
                    </td>
                    <td>{{ det.cantidad }}</td>
                    <td>${{ formatPrice(det.precioUnitario) }}</td>
                    <td><strong>${{ formatPrice(det.subTotal) }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="order-footer-row">
              <div class="order-address-info">
                <small>📍 Dirección de entrega: <strong>{{ ord.direccionEntrega || 'No especificada' }}</strong></small>
                <small v-if="ord.notas">📝 Notas: {{ ord.notas }}</small>
              </div>
              <div class="order-total-highlight">
                <span>Monto Total:</span>
                <strong>${{ formatPrice(ord.montoTotal) }}</strong>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- Pestaña 2: Mis Citas y Reservas -->
      <section v-if="activeTab === 'citas'" class="portal-section">
        <div class="section-top">
          <div>
            <h3>Mis Citas y Turnos Agendados</h3>
            <p>Consulta tus próximas citas y su estado de confirmación.</p>
          </div>
          <button class="btn-refresh" :disabled="pendingApps" @click="() => refreshApps()">
            🔄 {{ pendingApps ? 'Cargando...' : 'Actualizar Citas' }}
          </button>
        </div>

        <div v-if="pendingApps" class="loading-state">Cargando tus citas...</div>

        <div v-else-if="!appointments || appointments.length === 0" class="empty-card">
          <span class="empty-icon">📅</span>
          <h3>Aún no tienes citas agendadas</h3>
          <p>Reserva tu turno en pocos pasos sin esperas.</p>
          <NuxtLink to="/reservar" class="btn-primary" style="margin-top: 14px;">Agendar Cita Ahora</NuxtLink>
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
                <span>⏱️ Duración estimada:</span>
                <span>{{ app.duration || 45 }} minutos</span>
              </div>
              <div class="info-line">
                <span>💰 Tarifa:</span>
                <strong class="price-green">${{ formatPrice(app.price) }}</strong>
              </div>
            </div>

            <div class="app-card-footer">
              <button
                v-if="app.status !== 'cancelada' && app.status !== 'completada'"
                class="btn-cancel"
                @click="cancelAppointment(app._id)"
              >
                Cancelar Cita
              </button>
              <span v-else class="status-note">
                {{ app.status === 'completada' ? '✨ Cita Finalizada' : '❌ Cancelada' }}
              </span>
            </div>
          </article>
        </div>
      </section>

      <!-- Pestaña 3: Mi Perfil de Usuario (USUARIO) -->
      <section v-if="activeTab === 'perfil'" class="portal-section">
        <div class="section-top">
          <div>
            <h3>Datos de Usuario Registrados (USUARIO)</h3>
            <p>Información de cuenta y datos de contacto según el modelo de datos.</p>
          </div>
        </div>

        <div class="user-profile-box">
          <div class="profile-grid">
            <div class="profile-field">
              <label>Nombre Completo:</label>
              <strong>{{ authStore.user?.nombre || authStore.user?.name || '—' }}</strong>
            </div>
            <div class="profile-field">
              <label>Documento de Identidad:</label>
              <strong>{{ authStore.user?.documento || 'No registrado' }}</strong>
            </div>
            <div class="profile-field">
              <label>Correo Electrónico:</label>
              <strong>{{ authStore.user?.correo || authStore.user?.email || '—' }}</strong>
            </div>
            <div class="profile-field">
              <label>Teléfono de Contacto:</label>
              <strong>{{ authStore.user?.telefono || authStore.user?.phone || 'No registrado' }}</strong>
            </div>
            <div class="profile-field">
              <label>Dirección de Residencia:</label>
              <strong>{{ authStore.user?.direccion || 'No registrada' }}</strong>
            </div>
            <div class="profile-field">
              <label>Ubicación GPS:</label>
              <strong>{{ authStore.user?.ubicacionGPS || '4.60971,-74.08175 (Bogotá)' }}</strong>
            </div>
            <div class="profile-field">
              <label>Tipo de Usuario (Rol):</label>
              <span class="role-highlight">{{ authStore.user?.tipoUsuario || authStore.user?.role || 'cliente' }}</span>
            </div>
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
const activeTab = ref<'pedidos' | 'citas' | 'perfil'>('pedidos')
const defaultProdImg = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80'

// 1. Consultar Mis Pedidos (PEDIDO & DET_PEDIDO)
const { data: ordersData, pending: pendingOrders, refresh: refreshOrders } = await useFetch<{ success: boolean; data: any[] }>(
  '/api/orders',
  { query: { myOrders: 'true' } }
)
const orders = computed(() => ordersData.value?.data || [])

// 2. Consultar Mis Citas
const { data: appsData, pending: pendingApps, refresh: refreshApps } = await useFetch<{ success: boolean; data: any[] }>(
  '/api/client/my-appointments'
)
const appointments = computed(() => appsData.value?.data || [])

const cancelAppointment = async (id: string) => {
  if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return

  try {
    await $fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      body: { status: 'cancelada' }
    })
    await refreshApps()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Error al cancelar la cita.')
  }
}

const handleLogout = async () => {
  await authStore.logout()
}

const formatPrice = (val: number) => {
  return (val || 0).toLocaleString('es-CO')
}

const formatDate = (d: string) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
}

.client-navbar {
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

.client-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.welcome-card {
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

.welcome-info h2 {
  font-size: 1.8rem;
  color: var(--text-title);
  margin-bottom: 6px;
}

.welcome-actions {
  display: flex;
  gap: 12px;
}

.btn-big-book {
  padding: 12px 20px;
  font-size: 0.95rem;
  font-weight: 700;
}

/* Tabs */
.portal-tabs-nav {
  display: flex;
  gap: 12px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 2px;
}

.portal-tab-btn {
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

.portal-tab-btn.active {
  color: var(--primary);
  border-color: var(--primary);
}

.portal-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.section-top h3 {
  font-size: 1.4rem;
  color: var(--text-title);
}

.btn-refresh {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 600;
  color: var(--text-body);
  cursor: pointer;
}

/* Orders List */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 22px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.order-badge {
  font-weight: 800;
  color: var(--primary);
  font-size: 0.95rem;
  margin-right: 12px;
}

.order-date {
  font-size: 0.85rem;
  color: var(--text-body);
}

.status-pill {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-pill.pendiente {
  background: rgba(255, 193, 7, 0.2);
  color: #d39e00;
}

.status-pill.en-preparación {
  background: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.status-pill.completado {
  background: rgba(25, 135, 84, 0.15);
  color: #198754;
}

.status-pill.cancelado {
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.order-items-table table {
  width: 100%;
  border-collapse: collapse;
}

.order-items-table th {
  text-align: left;
  padding: 8px;
  font-size: 0.8rem;
  color: var(--text-body);
  opacity: 0.7;
}

.order-items-table td {
  padding: 10px 8px;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mini-thumb {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  object-fit: cover;
}

.order-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 10px;
}

.order-address-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.order-total-highlight {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.15rem;
  color: var(--primary-hover);
}

/* User Profile Grid */
.user-profile-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
  box-shadow: var(--shadow);
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-field label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-body);
  opacity: 0.7;
}

.profile-field strong {
  font-size: 1rem;
  color: var(--text-title);
}

.role-highlight {
  background: rgba(200, 157, 124, 0.15);
  color: var(--primary);
  padding: 4px 12px;
  border-radius: 999px;
  font-weight: 700;
  text-transform: uppercase;
  width: fit-content;
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

/* Appointments Cards Grid */
.appointments-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.app-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.app-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.service-pill {
  font-size: 0.75rem;
  color: var(--primary);
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.pendiente {
  background: rgba(255, 193, 7, 0.15);
  color: #d39e00;
}

.status-badge.confirmada {
  background: rgba(25, 135, 84, 0.15);
  color: #198754;
}

.status-badge.cancelada {
  background: rgba(220, 53, 69, 0.15);
  color: #dc3545;
}

.info-line {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.price-green {
  color: var(--primary-hover);
}

.app-card-footer {
  margin-top: auto;
  border-top: 1px solid var(--border);
  padding-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.btn-cancel {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #dc3545;
  padding: 6px 14px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
}
</style>
