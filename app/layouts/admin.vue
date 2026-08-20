<template>
  <div class="admin-layout">
    <!-- Overlay para móvil -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar Lateral -->
    <aside :class="['admin-sidebar', { open: sidebarOpen }]">
      <div class="sidebar-brand">
        <NuxtLink to="/admin" class="brand-link" @click="sidebarOpen = false">
          <span class="brand-icon">🌸</span>
          <div class="brand-text">
            <h2>LookBy</h2>
            <small>{{ authStore.user?.role === 'admin' ? 'Superadmin Platform' : 'Gestión de Salón' }}</small>
          </div>
        </NuxtLink>
        <button class="btn-close-sidebar" @click="sidebarOpen = false">✕</button>
      </div>

      <nav class="sidebar-nav">
        <!-- Vínculos de Superadministrador -->
        <div v-if="authStore.user?.role === 'admin'" class="nav-group-label">SUPERADMINISTRADOR</div>
        <NuxtLink v-if="authStore.user?.role === 'admin'" to="/admin" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
          <span class="nav-icon">🛡️</span>
          <span>Superadmin Global</span>
        </NuxtLink>

        <!-- Vínculos de Salón / Negocio -->
        <div class="nav-group-label">GESTIÓN DEL NEGOCIO</div>
        <NuxtLink to="/negocio" class="nav-item" exact-active-class="active" @click="sidebarOpen = false">
          <span class="nav-icon">📊</span>
          <span>Panel del Salón</span>
        </NuxtLink>

        <NuxtLink to="/admin/citas" class="nav-item" active-class="active" @click="sidebarOpen = false">
          <span class="nav-icon">📅</span>
          <span>Citas y Agenda</span>
        </NuxtLink>

        <NuxtLink to="/admin/clientes" class="nav-item" active-class="active" @click="sidebarOpen = false">
          <span class="nav-icon">👥</span>
          <span>Clientes</span>
        </NuxtLink>

        <NuxtLink to="/admin/servicios" class="nav-item" active-class="active" @click="sidebarOpen = false">
          <span class="nav-icon">💇</span>
          <span>Servicios</span>
        </NuxtLink>

        <NuxtLink to="/admin/inventario" class="nav-item" active-class="active" @click="sidebarOpen = false">
          <span class="nav-icon">🧴</span>
          <span>Inventario Salón</span>
        </NuxtLink>

        <!-- Portal Proveedores -->
        <div class="nav-group-label">PROVEEDORES & RED</div>
        <NuxtLink to="/proveedor" class="nav-item" active-class="active" @click="sidebarOpen = false">
          <span class="nav-icon">📦</span>
          <span>Portal Proveedores</span>
        </NuxtLink>

        <div class="nav-group-label">SITIO PÚBLICO</div>
        <NuxtLink to="/" class="nav-item public-site-link" target="_blank" @click="sidebarOpen = false">
          <span class="nav-icon">🌐</span>
          <span>Ver Web Pública ↗</span>
        </NuxtLink>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-meta">
            <strong>{{ authStore.user?.name || 'Administrador' }}</strong>
            <span class="role-pill">{{ authStore.user?.role || 'admin' }}</span>
          </div>
        </div>

        <div class="footer-actions">
          <ThemeToggle />
          <button class="logout-btn" title="Cerrar sesión" @click="handleLogout">
            🚪 Cerrar sesión
          </button>
        </div>
      </div>
    </aside>

    <!-- Área de Contenido Principal con Top Header Global -->
    <div class="admin-main">
      <!-- Top Bar Global -->
      <header class="admin-topbar">
        <div class="topbar-left">
          <button class="menu-toggle-btn" @click="sidebarOpen = !sidebarOpen" aria-label="Abrir menú">
            <span>☰</span>
          </button>

          <div class="breadcrumb-container">
            <NuxtLink to="/" class="topbar-home-btn" title="Ir a la portada pública">🌸 LookBy</NuxtLink>
            <span class="breadcrumb-sep">/</span>
            <span class="current-section-name">{{ currentSectionTitle }}</span>
          </div>
        </div>

        <div class="topbar-right">
          <!-- Accesos Rápidos de Movilidad -->
          <NuxtLink v-if="authStore.user?.role === 'admin'" to="/admin" class="topbar-nav-pill" active-class="active">
            🛡️ Superadmin
          </NuxtLink>
          <NuxtLink to="/negocio" class="topbar-nav-pill" active-class="active">
            📊 Salón
          </NuxtLink>
          <NuxtLink to="/admin/citas" class="topbar-nav-pill" active-class="active">
            📅 Citas
          </NuxtLink>
          <NuxtLink to="/proveedor" class="topbar-nav-pill" active-class="active">
            📦 Proveedores
          </NuxtLink>
          <NuxtLink to="/" class="topbar-nav-pill public" target="_blank">
            🌐 Web ↗
          </NuxtLink>

          <div class="topbar-divider"></div>

          <ThemeToggle />

          <button class="topbar-logout-btn" title="Cerrar sesión" @click="handleLogout">
            <span>🚪 Salir</span>
          </button>
        </div>
      </header>

      <main class="admin-page-container">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

const userInitial = computed(() => {
  const name = authStore.user?.name || 'A'
  return name.charAt(0).toUpperCase()
})

const currentSectionTitle = computed(() => {
  const p = route.path
  if (p === '/admin' || p === '/admin/') return 'Superadministrador Global'
  if (p.startsWith('/negocio')) return 'Panel del Salón'
  if (p.startsWith('/admin/citas')) return 'Citas y Agenda'
  if (p.startsWith('/admin/clientes')) return 'Directorio de Clientes'
  if (p.startsWith('/admin/servicios')) return 'Catálogo de Servicios'
  if (p.startsWith('/admin/inventario')) return 'Inventario del Salón'
  if (p.startsWith('/proveedor')) return 'Portal Proveedores'
  if (p.startsWith('/cliente')) return 'Portal de Cliente'
  return 'Panel de Control'
})

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-main);
  color: var(--text-body);
}

/* Sidebar */
.admin-sidebar {
  width: 270px;
  background-color: var(--bg-card);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 120;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-brand {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.8rem;
}

.brand-text h2 {
  font-size: 1.35rem;
  color: var(--text-title);
  font-weight: 700;
  line-height: 1.1;
}

.brand-text small {
  font-size: 0.72rem;
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.btn-close-sidebar {
  display: none;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  color: var(--text-body);
  cursor: pointer;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.nav-group-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--text-body);
  opacity: 0.6;
  letter-spacing: 0.08em;
  padding: 12px 14px 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  color: var(--text-body);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  transition: all 0.2s ease;
}

.nav-icon {
  font-size: 1.15rem;
}

.nav-item:hover {
  background-color: var(--bg-subtle);
  color: var(--text-title);
}

.nav-item.active {
  background-color: rgba(200, 157, 124, 0.15);
  color: var(--primary-hover);
  border: 1px solid rgba(200, 157, 124, 0.3);
}

.public-site-link {
  color: var(--accent);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--bg-subtle);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary);
  color: #ffffff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.95rem;
}

.user-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  gap: 2px;
}

.user-meta strong {
  font-size: 0.88rem;
  color: var(--text-title);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.role-pill {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--primary);
  background: rgba(200, 157, 124, 0.15);
  padding: 2px 8px;
  border-radius: 999px;
  width: fit-content;
}

.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.logout-btn {
  background: rgba(182, 46, 46, 0.08);
  border: 1px solid rgba(182, 46, 46, 0.25);
  color: #b12a2a;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #b12a2a;
  color: #ffffff;
}

/* Área Principal */
.admin-main {
  flex: 1;
  margin-left: 270px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Top Bar Global */
.admin-topbar {
  position: sticky;
  top: 0;
  background-color: var(--bg-card);
  border-bottom: 1px solid var(--border);
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-toggle-btn {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 1.1rem;
  color: var(--text-title);
  cursor: pointer;
  display: none;
}

.breadcrumb-container {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
}

.topbar-home-btn {
  color: var(--text-title);
  text-decoration: none;
  font-weight: 700;
}

.breadcrumb-sep {
  color: var(--text-body);
  opacity: 0.5;
}

.current-section-name {
  color: var(--primary);
  font-weight: 600;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.topbar-nav-pill {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  color: var(--text-body);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.topbar-nav-pill:hover {
  background: var(--bg-card);
  color: var(--text-title);
  border-color: var(--primary);
}

.topbar-nav-pill.active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.topbar-nav-pill.public {
  background: rgba(138, 154, 134, 0.15);
  color: var(--accent);
  border-color: rgba(138, 154, 134, 0.3);
}

.topbar-divider {
  width: 1px;
  height: 24px;
  background-color: var(--border);
  margin: 0 4px;
}

.topbar-logout-btn {
  background: rgba(182, 46, 46, 0.1);
  border: 1px solid rgba(182, 46, 46, 0.25);
  color: #b12a2a;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.topbar-logout-btn:hover {
  background: #b12a2a;
  color: #ffffff;
}

.admin-page-container {
  flex: 1;
  padding: 32px;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

/* Responsive */
@media (max-width: 960px) {
  .menu-toggle-btn {
    display: block;
  }

  .btn-close-sidebar {
    display: block;
  }

  .admin-sidebar {
    transform: translateX(-100%);
  }

  .admin-sidebar.open {
    transform: translateX(0);
  }

  .admin-main {
    margin-left: 0;
  }

  .admin-topbar {
    padding: 10px 16px;
  }

  .topbar-nav-pill:not(.active) {
    display: none;
  }

  .admin-page-container {
    padding: 20px 16px;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 110;
    backdrop-filter: blur(2px);
  }
}
</style>
