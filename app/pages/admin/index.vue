<template>
  <div class="superadmin-dashboard">
    <!-- Header -->
    <header class="sa-header">
      <div>
        <div class="sa-badge">🛡️ Superadministrador de Plataforma</div>
        <h1>Panel de Control Global LookBy</h1>
        <p>Gobernanza del sistema conforme al Diagrama Entidad-Relación (DER), gestión de roles y supervisión global.</p>
      </div>

      <div class="sa-actions">
        <button class="btn-secondary" :disabled="pending" @click="() => refreshAll()">
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
          <span class="gm-title">Usuarios (USUARIO)</span>
          <strong class="gm-value">{{ counts.total }}</strong>
        </div>
      </article>

      <article class="gm-card">
        <span class="gm-icon">🏢</span>
        <div>
          <span class="gm-title">Locales (LOCAL_BELLEZA)</span>
          <strong class="gm-value">{{ salons.length }}</strong>
        </div>
      </article>

      <article class="gm-card">
        <span class="gm-icon">📦</span>
        <div>
          <span class="gm-title">Proveedores (PROVEEDOR)</span>
          <strong class="gm-value">{{ suppliers.length }}</strong>
        </div>
      </article>

      <article class="gm-card">
        <span class="gm-icon">🛒</span>
        <div>
          <span class="gm-title">Pedidos (PEDIDO)</span>
          <strong class="gm-value">{{ orders.length }}</strong>
        </div>
      </article>

      <article class="gm-card">
        <span class="gm-icon">🛡️</span>
        <div>
          <span class="gm-title">Roles Definidos (ROL)</span>
          <strong class="gm-value">{{ roles.length }}</strong>
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
            <strong>Panel del Salón (LOCAL_BELLEZA)</strong>
            <small>Catálogos e ingresos</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/citas" class="hub-card">
          <span class="hub-icon">📅</span>
          <div class="hub-info">
            <strong>Agenda de Citas</strong>
            <small>Gestionar reservas</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/proveedor" class="hub-card">
          <span class="hub-icon">📦</span>
          <div class="hub-info">
            <strong>Portal Proveedor (PROVEEDOR)</strong>
            <small>Ofertas mayoristas</small>
          </div>
        </NuxtLink>

        <NuxtLink to="/cliente" class="hub-card">
          <span class="hub-icon">👤</span>
          <div class="hub-info">
            <strong>Portal Cliente</strong>
            <small>Mis pedidos y citas</small>
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

    <!-- Sección de Roles y Asignación (ROL & USUARIO_ROL) -->
    <section class="roles-management-section">
      <div class="table-header-bar">
        <div>
          <h3>Roles del Sistema y Asignaciones (ROL & USUARIO_ROL)</h3>
          <p>Roles registrados en la base de datos y usuarios asociados a cada rol.</p>
        </div>
      </div>

      <div class="roles-grid">
        <article v-for="role in roles" :key="role._id" class="role-card">
          <div class="role-top">
            <span class="role-icon">🛡️</span>
            <div>
              <h4>{{ role.nombre.toUpperCase() }}</h4>
              <small>{{ role.descripcion }}</small>
            </div>
          </div>
          <div class="role-bottom">
            <span>Usuarios asignados:</span>
            <strong>{{ role.userCount }}</strong>
          </div>
        </article>
      </div>
    </section>

    <!-- Gestión de Usuarios (USUARIO) -->
    <section class="users-management-section">
      <div class="table-header-bar">
        <div>
          <h3>Directorio de Usuarios de la Plataforma (USUARIO)</h3>
          <p>Supervisa cuentas con datos del DER (documento, ubicación GPS, dirección, teléfono y tipoUsuario).</p>
        </div>

        <div class="filters-row">
          <select v-model="filterRole" class="input-field role-filter-select">
            <option value="">Todos los Roles</option>
            <option value="cliente">Clientes</option>
            <option value="profesional">Profesionales / Negocios</option>
            <option value="proveedor">Proveedores</option>
            <option value="admin">Administradores</option>
          </select>

          <input
            v-model="searchQuery"
            type="text"
            class="input-field search-input"
            placeholder="Buscar por nombre, correo, documento..."
          />
        </div>
      </div>

      <div v-if="pending" class="loading-box">Cargando directorio de usuarios...</div>

      <div v-else-if="users.length === 0" class="empty-box">
        No se encontraron usuarios con los filtros aplicados.
      </div>

      <div v-else class="table-responsive">
        <table class="users-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Documento</th>
              <th>Contacto</th>
              <th>Dirección & GPS</th>
              <th>Tipo Usuario (Rol)</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u._id">
              <td>
                <div class="user-cell">
                  <div class="avatar-circle">{{ getInitial(u.nombre || u.name) }}</div>
                  <div>
                    <strong>{{ u.nombre || u.name }}</strong>
                    <small>{{ u.correo || u.email }}</small>
                  </div>
                </div>
              </td>
              <td><strong>{{ u.documento || '—' }}</strong></td>
              <td>
                <div class="contact-cell">
                  <span>📞 {{ u.telefono || u.phone || '—' }}</span>
                </div>
              </td>
              <td>
                <div class="contact-cell">
                  <small>📍 {{ u.direccion || 'No especificada' }}</small>
                  <small v-if="u.ubicacionGPS" class="gps-text">🌐 {{ u.ubicacionGPS }}</small>
                </div>
              </td>
              <td>
                <span :class="['role-badge', u.tipoUsuario || u.role]">
                  {{ u.tipoUsuario || u.role }}
                </span>
              </td>
              <td><small>{{ formatDate(u.createdAt) }}</small></td>
              <td>
                <div class="actions-cell">
                  <button class="btn-manage" @click="openEditModal(u)">⚙️ Gestionar</button>
                  <button
                    v-if="(u.tipoUsuario || u.role) !== 'admin' || counts.admin > 1"
                    class="btn-delete"
                    title="Eliminar usuario"
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

    <!-- Modal para Modificar Usuario & Rol (USUARIO_ROL) -->
    <div v-if="showModal && selectedUser" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Modificar Usuario & Asignación de Rol</h3>
          <button class="btn-close" @click="showModal = false">✕</button>
        </div>

        <form @submit.prevent="handleUpdateUser" class="modal-form">
          <div class="form-row">
            <label>
              Nombre Completo:
              <input v-model="editForm.nombre" type="text" class="input-field" required />
            </label>
            <label>
              Documento de Identidad:
              <input v-model="editForm.documento" type="text" class="input-field" />
            </label>
          </div>

          <div class="form-row">
            <label>
              Correo Electrónico:
              <input v-model="editForm.correo" type="email" class="input-field" required />
            </label>
            <label>
              Teléfono:
              <input v-model="editForm.telefono" type="text" class="input-field" />
            </label>
          </div>

          <div class="form-row">
            <label>
              Dirección:
              <input v-model="editForm.direccion" type="text" class="input-field" />
            </label>
            <label>
              Ubicación GPS:
              <input v-model="editForm.ubicacionGPS" type="text" class="input-field" placeholder="Lat,Long" />
            </label>
          </div>

          <div class="form-row">
            <label>
              Rol en Plataforma (ROL & USUARIO_ROL):
              <select v-model="editForm.tipoUsuario" class="input-field">
                <option value="cliente">Cliente</option>
                <option value="profesional">Profesional / Salón</option>
                <option value="proveedor">Proveedor</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            <label>
              Nombre de Salón / Empresa:
              <input v-model="editForm.businessName" type="text" class="input-field" />
            </label>
          </div>

          <div v-if="modalError" class="modal-error">{{ modalError }}</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showModal = false">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
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

// 1. Usuarios
const { data, pending, refresh } = await useFetch<{ success: boolean; data: { users: any[]; counts: any } }>(
  '/api/admin/users',
  { query: queryParams }
)
const users = computed(() => data.value?.data?.users || [])
const counts = computed(() => data.value?.data?.counts || { total: 0, cliente: 0, profesional: 0, proveedor: 0, admin: 0 })

// 2. Roles (ROL & USUARIO_ROL)
const { data: rolesData, refresh: refreshRoles } = await useFetch<{ success: boolean; data: any[] }>('/api/admin/roles')
const roles = computed(() => rolesData.value?.data || [])

// 3. Locales
const { data: salonsData, refresh: refreshSalons } = await useFetch<{ success: boolean; data: any[] }>('/api/beauty-salons')
const salons = computed(() => salonsData.value?.data || [])

// 4. Proveedores
const { data: suppliersData, refresh: refreshSuppliers } = await useFetch<{ success: boolean; data: any[] }>('/api/suppliers')
const suppliers = computed(() => suppliersData.value?.data || [])

// 5. Pedidos
const { data: ordersData, refresh: refreshOrders } = await useFetch<{ success: boolean; data: any[] }>('/api/orders')
const orders = computed(() => ordersData.value?.data || [])

// Modal Edición
const showModal = ref(false)
const selectedUser = ref<any>(null)
const saving = ref(false)
const modalError = ref('')

const editForm = reactive({
  nombre: '',
  documento: '',
  correo: '',
  telefono: '',
  direccion: '',
  ubicacionGPS: '',
  tipoUsuario: 'cliente',
  businessName: ''
})

const openEditModal = (user: any) => {
  selectedUser.value = user
  editForm.nombre = user.nombre || user.name || ''
  editForm.documento = user.documento || ''
  editForm.correo = user.correo || user.email || ''
  editForm.telefono = user.telefono || user.phone || ''
  editForm.direccion = user.direccion || ''
  editForm.ubicacionGPS = user.ubicacionGPS || ''
  editForm.tipoUsuario = user.tipoUsuario || user.role || 'cliente'
  editForm.businessName = user.businessName || ''
  modalError.value = ''
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

    // Sincronizar también asignación en USUARIO_ROL
    await $fetch('/api/admin/roles/assign', {
      method: 'POST',
      body: {
        idUsuario: selectedUser.value._id,
        roleName: editForm.tipoUsuario,
        descripcion: `Actualizado por Superadministrador a ${editForm.tipoUsuario}`
      }
    })

    showModal.value = false
    await refreshAll()
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
    await refreshAll()
  } catch (e: any) {
    alert(e?.data?.statusMessage || 'Error al eliminar usuario.')
  }
}

const handleLogout = async () => {
  await authStore.logout()
}

const refreshAll = async () => {
  await Promise.all([refresh(), refreshRoles(), refreshSalons(), refreshSuppliers(), refreshOrders()])
}

const getInitial = (name: string) => {
  return (name || 'U').charAt(0).toUpperCase()
}

const formatDate = (dStr: string) => {
  if (!dStr) return '—'
  const d = new Date(dStr)
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
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

/* Métricas Globales */
.global-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.gm-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow);
}

.gm-icon {
  font-size: 1.8rem;
}

.gm-title {
  display: block;
  font-size: 0.78rem;
  color: var(--text-body);
  font-weight: 600;
}

.gm-value {
  font-size: 1.5rem;
  color: var(--text-title);
  font-weight: 800;
}

/* Roles Section */
.roles-management-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--shadow);
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.role-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-icon {
  font-size: 1.6rem;
}

.role-bottom {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--border);
  padding-top: 8px;
  font-size: 0.85rem;
}

/* Quick Hub */
.sa-quick-hub {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
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
}

.hub-icon {
  font-size: 1.6rem;
}

.hub-info strong {
  display: block;
  font-size: 0.9rem;
  color: var(--text-title);
}

.hub-info small {
  font-size: 0.75rem;
  color: var(--text-body);
}

/* Users Table Section */
.users-management-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.table-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.filters-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.table-responsive {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  text-align: left;
  padding: 12px 14px;
  font-size: 0.8rem;
  color: var(--text-body);
  border-bottom: 1px solid var(--border);
}

.users-table td {
  padding: 14px;
  border-bottom: 1px solid var(--border);
  font-size: 0.88rem;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.gps-text {
  color: var(--accent);
  font-family: monospace;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.role-badge.admin {
  background: rgba(182, 46, 46, 0.15);
  color: #b12a2a;
}

.role-badge.profesional {
  background: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.role-badge.proveedor {
  background: rgba(111, 66, 193, 0.15);
  color: #6f42c1;
}

.role-badge.cliente {
  background: rgba(25, 135, 84, 0.15);
  color: #198754;
}

.actions-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-manage {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-delete {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: grid;
  place-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  max-width: 650px;
  width: 100%;
  padding: 28px;
  box-shadow: var(--shadow);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-row label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}
</style>