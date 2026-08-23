<template>
  <div class="business-dashboard">
    <!-- Header del Dashboard -->
    <header class="dash-header">
      <div class="dash-welcome">
        <h1>Panel del Negocio / Salón</h1>
        <p>Bienvenido, <strong>{{ authStore.user?.name }}</strong> ({{ authStore.user?.businessName || 'Mi Salón' }})</p>
      </div>

      <div class="dash-actions">
        <NuxtLink to="/admin/citas" class="btn-primary">+ Nueva Cita</NuxtLink>
        <button class="btn-secondary" :disabled="pending" @click="() => refresh()">
          🔄 {{ pending ? 'Actualizando...' : 'Refrescar' }}
        </button>
      </div>
    </header>

    <div v-if="pending" class="dash-loading">Cargando métricas de tu negocio...</div>

    <div v-else class="dash-content">
      <!-- Tarjetas de Métricas -->
      <section class="metrics-grid">
        <article class="metric-card">
          <div class="metric-icon income">💵</div>
          <div class="metric-details">
            <span class="metric-title">Ingresos del Mes</span>
            <strong class="metric-value">${{ (stats?.monthlyRevenue || 0).toLocaleString('es-CO') }}</strong>
            <small class="metric-hint">Calculado de citas completadas</small>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-icon today">📅</div>
          <div class="metric-details">
            <span class="metric-title">Citas de Hoy</span>
            <strong class="metric-value">{{ stats?.todayAppointments || 0 }}</strong>
            <small class="metric-hint">Programadas para atender hoy</small>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-icon total">📈</div>
          <div class="metric-details">
            <span class="metric-title">Citas del Mes</span>
            <strong class="metric-value">{{ stats?.monthlyAppointments || 0 }}</strong>
            <small class="metric-hint">Total registradas este mes</small>
          </div>
        </article>

        <article class="metric-card">
          <div class="metric-icon clients">👥</div>
          <div class="metric-details">
            <span class="metric-title">Directorio de Clientes</span>
            <strong class="metric-value">{{ stats?.totalClients || 0 }}</strong>
            <small class="metric-hint">Clientes registrados en tu negocio</small>
          </div>
        </article>
      </section>

      <!-- Alerta de Stock Bajo -->
      <div v-if="stats?.lowStockCount > 0" class="stock-warning-banner">
        <span class="warn-icon">⚠️</span>
        <div class="warn-text">
          <strong>Atención: Tienes {{ stats.lowStockCount }} productos con existencias en nivel crítico.</strong>
          <p>Revisa el inventario de tu salón para solicitar insumos a los proveedores.</p>
        </div>
        <NuxtLink to="/admin/inventario" class="btn-warn-action">Ver Inventario</NuxtLink>
      </div>

      <!-- Accesos Rápidos a Módulos del Salón -->
      <section class="quick-links-section">
        <h3>Módulos de tu Salón</h3>
        <div class="quick-cards-grid">
          <NuxtLink to="/admin/citas" class="quick-card">
            <span class="qc-icon">📅</span>
            <h4>Agenda de Citas</h4>
            <p>Gestiona reservas, confirma y completa citas.</p>
          </NuxtLink>

          <NuxtLink to="/admin/clientes" class="quick-card">
            <span class="qc-icon">👥</span>
            <h4>Directorio de Clientes</h4>
            <p>Historial de visitas y datos de contacto.</p>
          </NuxtLink>

          <NuxtLink to="/admin/servicios" class="quick-card">
            <span class="qc-icon">💇</span>
            <h4>Catálogo de Servicios</h4>
            <p>Configura precios, duraciones y categorías.</p>
          </NuxtLink>

          <NuxtLink to="/admin/inventario" class="quick-card">
            <span class="qc-icon">🧴</span>
            <h4>Control de Inventario</h4>
            <p>Existencias, alertas de stock y costos.</p>
          </NuxtLink>
        </div>
      </section>
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

const { data, pending, refresh } = await useFetch<{ success: boolean; data: any }>('/api/dashboard/stats')
const stats = computed(() => data.value?.data)
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
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.dash-welcome h1 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: var(--text-title);
  margin-bottom: 4px;
}

.dash-welcome p {
  color: var(--text-body);
  font-size: 0.95rem;
}

.dash-actions {
  display: flex;
  gap: 10px;
}

.dash-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 22px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 18px;
}

.metric-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  background: var(--bg-subtle);
  flex-shrink: 0;
}

.metric-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-title {
  font-size: 0.82rem;
  color: var(--text-body);
  font-weight: 600;
}

.metric-value {
  font-size: 1.5rem;
  color: var(--text-title);
  line-height: 1.2;
}

.metric-hint {
  font-size: 0.72rem;
  color: var(--text-body);
}

.stock-warning-banner {
  background: rgba(220, 160, 50, 0.1);
  border: 1px solid rgba(220, 160, 50, 0.3);
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.warn-icon {
  font-size: 1.8rem;
}

.warn-text {
  flex: 1;
  font-size: 0.9rem;
}

.btn-warn-action {
  background: #c48a14;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.85rem;
}

.quick-links-section h3 {
  font-size: 1.2rem;
  color: var(--text-title);
  margin-bottom: 14px;
}

.quick-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.quick-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 20px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.quick-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
}

.qc-icon {
  font-size: 1.8rem;
}

.quick-card h4 {
  font-size: 1.05rem;
  color: var(--text-title);
}

.quick-card p {
  font-size: 0.82rem;
  color: var(--text-body);
}

.dash-loading {
  text-align: center;
  padding: 40px;
  color: var(--text-body);
}
</style>
