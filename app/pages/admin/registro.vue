<template>
  <div class="admin-auth-shell">
    <div class="top-nav">
      <ThemeToggle />
    </div>

    <div class="register-card">
      <div class="register-header">
        <span class="brand-badge">LookBy</span>
        <h1>Crear Cuenta (USUARIO)</h1>
        <p>Selecciona tu perfil de usuario y únete al ecosistema de belleza.</p>
      </div>

      <!-- Selector de Rol (ROL) -->
      <div class="role-selector-section">
        <span class="section-label">¿Cómo deseas usar LookBy? (ROL)</span>
        <div class="roles-grid">
          <button
            v-for="r in availableRoles"
            :key="r.id"
            type="button"
            :class="['role-tile', { active: form.role === r.id }]"
            @click="form.role = r.id"
          >
            <span class="role-icon">{{ r.icon }}</span>
            <div class="role-info">
              <strong>{{ r.title }}</strong>
              <small>{{ r.desc }}</small>
            </div>
          </button>
        </div>
      </div>

      <!-- Formulario de Registro -->
      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-row">
          <label>
            <span>Nombre Completo *</span>
            <input v-model="form.name" class="input-field" placeholder="Tu nombre y apellido" required />
          </label>

          <label>
            <span>Documento de Identidad</span>
            <input v-model="form.documento" class="input-field" placeholder="C.C., NIT o Pasaporte" />
          </label>
        </div>

        <div class="form-row">
          <label>
            <span>Teléfono / WhatsApp *</span>
            <input v-model="form.phone" class="input-field" placeholder="Ej. 310 123 4567" required />
          </label>

          <label>
            <span>Dirección de Residencia / Salón</span>
            <input v-model="form.direccion" class="input-field" placeholder="Ej. Calle 85 #15-32, Bogotá" />
          </label>
        </div>

        <!-- Campos dinámicos si es profesional o proveedor -->
        <div v-if="form.role === 'profesional' || form.role === 'proveedor'" class="form-row">
          <label>
            <span>{{ form.role === 'profesional' ? 'Nombre de tu Salón / Marca (LOCAL_BELLEZA)' : 'Razón Social / Distribuidora (PROVEEDOR)' }}</span>
            <input v-model="form.businessName" class="input-field" :placeholder="form.role === 'profesional' ? 'Ej. LookBy Studio & Spa' : 'Ej. ProHair Distribuciones S.A.S.'" />
          </label>

          <label>
            <span>{{ form.role === 'profesional' ? 'Especialidad Principal' : 'Categoría de Productos' }}</span>
            <input v-model="form.specialty" class="input-field" :placeholder="form.role === 'profesional' ? 'Peluquería, Barbería, Uñas...' : 'Capilar, Cosmética, Mobiliario...'" />
          </label>
        </div>

        <!-- Campo de código si es Administrador de Plataforma -->
        <div v-if="form.role === 'admin'" class="admin-code-box">
          <label>
            <span>Clave Secreta de Administrador de Plataforma *</span>
            <input
              v-model="form.adminCode"
              type="password"
              class="input-field"
              placeholder="Ingresa la clave maestra del sistema"
              required
            />
          </label>
          <small class="admin-hint">⚠️ Este rol es exclusivo para el equipo operador de la plataforma web LookBy.</small>
        </div>

        <label>
          <span>Correo Electrónico *</span>
          <input v-model="form.email" type="email" class="input-field" placeholder="tu@correo.com" autocomplete="email" required />
        </label>

        <div class="form-row">
          <label>
            <span>Contraseña *</span>
            <input v-model="form.password" type="password" class="input-field" placeholder="Mínimo 6 caracteres" autocomplete="new-password" required minlength="6" />
          </label>

          <label>
            <span>Confirmar Contraseña *</span>
            <input v-model="form.confirmPassword" type="password" class="input-field" placeholder="Repite tu contraseña" autocomplete="new-password" required />
          </label>
        </div>

        <div v-if="error" class="admin-error">{{ error }}</div>

        <button class="btn-primary register-submit" type="submit" :disabled="submitting">
          {{ submitting ? 'Creando tu cuenta...' : 'Registrarse en LookBy' }}
        </button>
      </form>

      <div class="register-footer">
        <span>¿Ya tienes una cuenta registrada?</span>
        <NuxtLink to="/admin/login" class="login-link">Iniciar sesión aquí</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore, type UserRole } from '../../stores/auth'

definePageMeta({
  middleware: ['admin-guest']
})

const authStore = useAuthStore()

const availableRoles = [
  {
    id: 'cliente' as UserRole,
    icon: '👤',
    title: 'Cliente',
    desc: 'Para reservar citas y comprar productos'
  },
  {
    id: 'profesional' as UserRole,
    icon: '💇',
    title: 'Profesional / Local',
    desc: 'Para administrar salones y catálogos'
  },
  {
    id: 'proveedor' as UserRole,
    icon: '📦',
    title: 'Proveedor',
    desc: 'Para suministrar insumos al por mayor'
  },
  {
    id: 'admin' as UserRole,
    icon: '🛡️',
    title: 'Administrador',
    desc: 'Para gestión total del sistema (Requiere clave)'
  }
]

const form = reactive({
  name: '',
  documento: '',
  phone: '',
  direccion: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'cliente' as UserRole,
  businessName: '',
  specialty: '',
  adminCode: ''
})

const submitting = ref(false)
const error = ref('')

const handleRegister = async () => {
  error.value = ''

  if (form.password !== form.confirmPassword) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  submitting.value = true

  try {
    const user = await authStore.register({
      name: form.name,
      documento: form.documento,
      phone: form.phone,
      direccion: form.direccion,
      email: form.email,
      password: form.password,
      role: form.role,
      businessName: form.businessName,
      specialty: form.specialty,
      adminCode: form.adminCode
    })

    const targetRoute = authStore.getRoleHomeRoute(user.role)
    await navigateTo(targetRoute)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Error al procesar el registro.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.admin-auth-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px 20px;
  background: radial-gradient(circle at top right, var(--bg-card), var(--bg-main));
}

.top-nav {
  position: absolute;
  top: 20px;
  right: 20px;
}

.register-card {
  width: 100%;
  max-width: 640px;
  background-color: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 36px;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.register-header {
  text-align: center;
}

.brand-badge {
  display: inline-block;
  background-color: rgba(200, 157, 124, 0.15);
  color: var(--primary);
  font-weight: 800;
  font-size: 0.85rem;
  padding: 4px 14px;
  border-radius: 999px;
  margin-bottom: 8px;
}

.register-header h1 {
  font-size: 1.85rem;
  color: var(--text-title);
  margin-bottom: 4px;
}

.register-header p {
  color: var(--text-body);
  font-size: 0.9rem;
}

.role-selector-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-title);
}

.roles-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.role-tile {
  background: var(--bg-subtle);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-tile:hover {
  border-color: var(--primary);
}

.role-tile.active {
  background: rgba(200, 157, 124, 0.12);
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}

.role-icon {
  font-size: 1.5rem;
}

.role-info strong {
  display: block;
  font-size: 0.88rem;
  color: var(--text-title);
}

.role-info small {
  font-size: 0.72rem;
  color: var(--text-body);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.register-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-title);
}

.admin-code-box {
  background: rgba(182, 46, 46, 0.06);
  border: 1px dashed rgba(182, 46, 46, 0.3);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.admin-hint {
  font-size: 0.75rem;
  color: #b12a2a;
  font-weight: 600;
}

.admin-error {
  background-color: rgba(182, 46, 46, 0.1);
  color: #b12a2a;
  border: 1px solid rgba(182, 46, 46, 0.25);
  padding: 12px;
  border-radius: 10px;
  font-size: 0.88rem;
  text-align: center;
}

.register-submit {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  margin-top: 6px;
}

.register-footer {
  text-align: center;
  font-size: 0.88rem;
  color: var(--text-body);
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-top: 1px solid var(--border);
  padding-top: 18px;
}

.login-link {
  color: var(--primary);
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 600px) {
  .roles-grid,
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
