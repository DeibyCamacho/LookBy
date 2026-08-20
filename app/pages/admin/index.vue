<template>
  <div class="superadmin-dashboard">
    <!-- Header -->
    <header class="sa-header">
      <div>
        <div class="sa-badge">🛡️ Superadministrador de Plataforma</div>
        <h1>Panel de Control Global LookBy</h1>
        <p>Gestión centralizada de usuarios, roles de la plataforma y resolución de casos excepcionales.</p>
      </div>

      <div class="sa-actions">
        <button class="btn-secondary" :disabled="pending" @click="() => refresh()">
          🔄 {{ pending ? 'Cargando...' : 'Actualizar Datos' }}
        </button>
        <button class="btn-logout-sa" @click="handleLogout">
          🚪 Cerrar Sesión
        </button>
      </div>
    </header>

    <!-- Métricas Globales de la Plataforma -->
    <section class="global-metrics-grid">
      <article class="gm-card">
        <span class="gm-icon">👥</span>
        <div>
          <span class="gm-title">Usuarios Totales</span>
          <strong class="gm-value">{{ counts.total }}</strong>
        </div>
      </article>

      <article class="gm-card">
        <span class="gm-icon">👤</span>
        <div>
          <span class="gm-title">Clientes Registrados</span>
          <strong class="gm-value">{{ counts.cliente }}</strong>
        </div>
      </article>

      <article class="gm-card">
        <span class="gm-icon">💇</span>
        <div>
          <span class="gm-title">Profesionales / Salones</span>
          <strong class="gm-value">{{ counts.profesional }}</strong>
        </div>
      </article>

      <article class="gm-card">
        <span class="gm-icon">📦</span>
        <div>
          <span class="gm-title">Proveedores</span>
          <strong class="gm-value">{{ counts.proveedor }}</strong>
        </div>
      </article>

      <article class="gm-card">
        <span class="gm-icon">🛡️</span>
        <div>
          <span class="gm-title">Administradores</span>
          <strong class="gm-value">{{ counts.admin }}</strong>
        </div>
      </article>
    </section>

    <!-- Hub de Movilidad Rápida para Superadmin -->
    <section class="sa-quick-hub">
      <div class="hub-header">
        <span class="hub-eyebrow">🚀 Movilidad Rápida de Plataforma</span>
        <h3>Acceso Directo a los Módulos del Sistema</h3>
      </div>
      <div class="hub-grid">
        <NuxtLink to="/negocio" class="hub-card">
          <span class="hub-icon">📊</span>
          <div class="hub-info">
            <strong>Panel del Salón</strong>
            <small>Métricas e ingresos</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/citas" class="hub-card">
          <span class="hub-icon">📅</span>
          <div class="hub-info">
            <strong>Agenda de Citas</strong>
            <small>Gestionar reservas</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/clientes" class="hub-card">
          <span class="hub-icon">👥</span>
          <div class="hub-info">
            <strong>Clientes</strong>
            <small>Directorio e historial</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/servicios" class="hub-card">
          <span class="hub-icon">💇</span>
          <div class="hub-info">
            <strong>Servicios</strong>
            <small>Catálogo y tarifas</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/inventario" class="hub-card">
          <span class="hub-icon">🧴</span>
          <div class="hub-info">
            <strong>Inventario Salón</strong>
            <small>Existencias y alertas</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/proveedor" class="hub-card">
          <span class="hub-icon">📦</span>
          <div class="hub-info">
            <strong>Portal Proveedor</strong>
            <small>Insumos mayoreo</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/cliente" class="hub-card">
          <span class="hub-icon">👤</span>
          <div class="hub-info">
            <strong>Portal Cliente</strong>
            <small>Vista de agendamiento</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/" class="hub-card public" target="_blank">
          <span class="hub-icon">🌐</span>
          <div class="hub-info">
            <strong>Web Pública</strong>
            <small>Portada y catálogo ↗</small>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Gestión de Usuarios y Casos Excepcionales -->
    <section class="users-management-section">
      <div class="table-header-bar">
        <div>
          <h3>Directorio de Usuarios de la Plataforma</h3>
          <p>Supervisa las cuentas registradas, ajusta roles o resuelve incidencias de usuarios.</p>
        </div>

        <div class="filters-row">
          <!-- Filtro por Rol -->
          <select v-model="filterRole" class="input-field role-filter-select">
            <option value="">Todos los Roles</option>
            <option value="cliente">Clientes</option>
            <option value="profesional">Profesionales / Negocios</option>
            <option value="proveedor">Proveedores</option>
            <option value="admin">Administradores</option>
          </select>

          <!-- Buscador -->
          <input
            v-model="searchQuery"
            class="input-field search-input"
            placeholder="Buscar por nombre, correo, teléfono o negocio..."
          />
        </div>
      </div>

      <div v-if="pending" class="loading-box">Cargando directorio de usuarios...</div>

      <div v-else-if="usersList.length === 0" class="empty-box">
        <p>No se encontraron usuarios con los filtros especificados.</p>
      </div>

      <div v-else class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Contacto</th>
              <th>Rol Actual</th>
              <th>Negocio / Especialidad</th>
              <th>Fecha Registro</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usersList" :key="u._id">
              <td>
                <div class="user-name-cell">
                  <strong>{{ u.name }}</strong>
                  <small>{{ u.email }}</small>
                </div>
              </td>
              <td>{{ u.phone || 'Sin registrar' }}</td>
              <td>
                <span :class="['role-badge', u.role]">{{ u.role }}</span>
              </td>
              <td>
                <span v-if="u.businessName || u.specialty">
                  {{ u.businessName }} <small v-if="u.specialty">({{ u.specialty }})</small>
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>{{ formatDate(u.createdAt) }}</td>
              <td style="text-align: right;">
                <div class="action-btn-group">
                  <button class="btn-action-edit" title="Modificar Rol o Datos" @click="openEditModal(u)">
                    ⚙️ Gestionar
                  </button>
                  <button
                    v-if="u._id !== authStore.user?._id"
                    class="btn-action-del"
                    title="Eliminar Usuario"
                    @click="deleteUser(u._id)"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal de Gestión de Usuario -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h2>Gestionar Usuario (Caso Excepcional)</h2>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <form class="modal-form" @submit.prevent="handleUpdateUser">
          <label>
            <span>Nombre del Usuario</span>
            <input v-model="editForm.name" class="input-field" required />
          </label>

          <label>
            <span>Rol en la Plataforma *</span>
            <select v-model="editForm.role" class="input-field" required>
              <option value="cliente">👤 Cliente</option>
              <option value="profesional">💇 Profesional / Negocio</option>
              <option value="proveedor">📦 Proveedor</option>
              <option value="admin">🛡️ Administrador de Plataforma</option>
            </select>
          </label>

          <label>
            <span>Teléfono / WhatsApp</span>
            <input v-model="editForm.phone" class="input-field" />
          </label>

          <div class="form-row">
            <label>
              <span>Nombre del Negocio / Salón</span>
              <input v-model="editForm.businessName" class="input-field" />
            </label>

            <label>
              <span>Especialidad / Rubro</span>
              <input v-model="editForm.specialty" class="input-field" />
            </label>
          </div>

          <div v-if="modalError" class="modal-error">{{ modalError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Guardando Cambios...' : 'Actualizar Usuario' }}
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

const filterRole = ref('')
const searchQuery = ref('')

const queryParams = computed(() => {
  const q: any = {}
  if (filterRole.value) q.role = filterRole.value
  if (searchQuery.value) q.q = searchQuery.value
  return q
})

const { data, pending, refresh } = await useFetch<{ success: boolean; data: { users: any[]; counts: any } }>(
  '/api/admin/users',
  { query: queryParams }
)

const usersList = computed(() => data.value?.data?.users || [])
const counts = computed(() => data.value?.data?.counts || { total: 0, admin: 0, profesional: 0, proveedor: 0, cliente: 0 })

// Modal de edición
const showModal = ref(false)
const selectedUser = ref<any>(null)
const saving = ref(false)
const modalError = ref('')

const editForm = reactive({
  name: '',
  role: 'cliente',
  phone: '',
  businessName: '',
  specialty: ''
})

const openEditModal = (user: any) => {
  selectedUser.value = user
  modalError.value = ''
  editForm.name = user.name || ''
  editForm.role = user.role || 'cliente'
  editForm.phone = user.phone || ''
  editForm.businessName = user.businessName || ''
  editForm.specialty = user.specialty || ''
  showModal.value = true
}

const handleUpdateUser = async () => {
  if (!selectedUser.value) return
  saving.value = true
  modalError.value = ''

  try {
    await $fetch(`/api/admin/users/${selectedUser.value._id}`, {
      method: 'PUT',
      body: editForm
    })
    showModal.value = false
    await refresh()
  } catch (err: any) {
    modalError.value = err?.data?.statusMessage || err?.message || 'Error al actualizar.'
  } finally {
    saving.value = false
  }
}

const deleteUser = async (id: string) => {
  if (!confirm('¿Estás seguro de eliminar este usuario de la plataforma?')) return

  try {
    await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Error al eliminar usuario.')
  }
}

const handleLogout = async () => {
  await authStore.logout()
}

const formatDate = (dStr: string) => {
  if (!dStr) return '—'
  const d = new Date(dStr)
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.superadmin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.sa-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
}

.sa-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-logout-sa {
  background: rgba(182, 46, 46, 0.1);
  border: 1px solid rgba(182, 46, 46, 0.3);
  color: #b12a2a;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout-sa:hover {
  background: #b12a2a;
  color: #ffffff;
}

.sa-badge {
  display: inline-block;
  background: rgba(200, 157, 124, 0.15);
  color: var(--primary);
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.sa-header h1 {
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  color: var(--text-title);
  margin-bottom: 4px;
}

.sa-header p {
  color: var(--text-body);
  font-size: 0.95rem;
}

/* Métricas Globales */
.global-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.gm-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  gap: 14px;
}

.gm-icon {
  font-size: 1.6rem;
  background: var(--bg-subtle);
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
}

.gm-title {
  display: block;
  font-size: 0.78rem;
  color: var(--text-body);
  font-weight: 600;
}

.gm-value {
  font-size: 1.4rem;
  color: var(--text-title);
}

/* Gestión de Usuarios */
.users-management-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.table-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.table-header-bar h3 {
  font-size: 1.25rem;
  color: var(--text-title);
}

.table-header-bar p {
  font-size: 0.85rem;
  color: var(--text-body);
}

.filters-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.role-filter-select {
  width: 180px;
}

.search-input {
  width: 280px;
}

.users-table-container {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.users-table th {
  text-align: left;
  padding: 12px;
  color: var(--text-body);
  font-weight: 600;
  border-bottom: 1px solid var(--border);
}

.users-table td {
  padding: 14px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-title);
}

.user-name-cell {
  display: flex;
  flex-direction: column;
}

.user-name-cell small {
  color: var(--text-body);
  font-size: 0.78rem;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
}

.role-badge.admin {
  background: rgba(182, 46, 46, 0.15);
  color: #b12a2a;
}

.role-badge.profesional {
  background: rgba(200, 157, 124, 0.18);
  color: var(--primary);
}

.role-badge.proveedor {
  background: rgba(100, 140, 220, 0.15);
  color: #3b71ca;
}

.role-badge.cliente {
  background: rgba(138, 154, 134, 0.18);
  color: var(--accent);
}

.text-muted {
  color: var(--text-body);
  opacity: 0.5;
}

.action-btn-group {
  display: inline-flex;
  gap: 8px;
}

.btn-action-edit {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  color: var(--text-title);
}

.btn-action-edit:hover {
  background: var(--bg-card);
  border-color: var(--primary);
}

.btn-action-del {
  background: transparent;
  border: 1px solid rgba(182, 46, 46, 0.3);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 0.85rem;
}

.btn-action-del:hover {
  background: rgba(182, 46, 46, 0.1);
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
  width: min(100%, 520px);
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
  font-size: 1.3rem;
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

.modal-error {
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

.loading-box,
.empty-box {
  padding: 40px;
  text-align: center;
  color: var(--text-body);
}

@media (max-width: 768px) {
  .filters-row {
    width: 100%;
  }

  .role-filter-select,
  .search-input {
    width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}

/* Hub de Movilidad Rápida */
.sa-quick-hub {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hub-eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hub-header h3 {
  font-size: 1.25rem;
  color: var(--text-title);
  margin-top: 2px;
}

.hub-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.hub-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.hub-card:hover {
  background: var(--bg-card);
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.hub-card.public {
  border-color: rgba(138, 154, 134, 0.3);
}

.hub-icon {
  font-size: 1.6rem;
  flex-shrink: 0;
}

.hub-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hub-info strong {
  font-size: 0.9rem;
  color: var(--text-title);
}

.hub-info small {
  font-size: 0.75rem;
  color: var(--text-body);
}
</style>