<template>
  <div class="admin-auth-shell">
    <div class="top-nav">
      <ThemeToggle />
    </div>

    <div class="register-card">
      <div class="register-header">
        <span class="brand-badge">LookBy</span>
        <h1>Crear Cuenta</h1>
        <p>Selecciona tu perfil y únete a la plataforma de belleza.</p>
      </div>

      <!-- Selector de Rol -->
      <div class="role-selector-section">
        <span class="section-label">¿Cómo deseas usar LookBy?</span>
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
            <input v-model="form.name" class="input-field" placeholder="Tu nombre" required />
          </label>

          <label>
            <span>Teléfono / WhatsApp *</span>
            <input v-model="form.phone" class="input-field" placeholder="Ej. 310 123 4567" required />
          </label>
        </div>

        <!-- Campos dinámicos si es profesional o proveedor -->
        <div v-if="form.role === 'profesional' || form.role === 'proveedor'" class="form-row">
          <label>
            <span>{{ form.role === 'profesional' ? 'Nombre de tu Salón / Marca' : 'Nombre de la Empresa / Distribuidora' }}</span>
            <input v-model="form.businessName" class="input-field" :placeholder="form.role === 'profesional' ? 'Ej. Studio Glam' : 'Ej. Distribuciones Belleza S.A.S.'" />
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
    desc: 'Para reservar citas y descubrir servicios'
  },
  {
    id: 'profesional' as UserRole,
    icon: '💇',
    title: 'Profesional / Negocio',
    desc: 'Para prestar servicios y gestionar agenda'
  },
  {
    id: 'proveedor' as UserRole,
    icon: '📦',
    title: 'Proveedor',
    desc: 'Para comercializar productos e insumos'
  },
  {
    id: 'admin' as UserRole,
    icon: '🛡️',
    title: 'Administrador',
    desc: 'Para gestión total de la plataforma (Requiere clave)'
  }
]

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: 'cliente' as UserRole,
  businessName: '',
  specialty: '',
  adminCode: ''
})

const error = ref('')
const submitting = ref(false)

const handleRegister = async () => {
  error.value = ''

  if (!form.name.trim() || !form.email.trim() || !form.password || !form.phone.trim()) {
    error.value = 'Por favor completa todos los campos obligatorios.'
    return
  }

  if (form.role === 'admin' && !form.adminCode.trim()) {
    error.value = 'Debes ingresar la clave de autorización de Administrador.'
    return
  }

  if (form.password.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  submitting.value = true

  try {
    const user = await authStore.register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      role: form.role,
      businessName: form.businessName.trim(),
      specialty: form.specialty.trim(),
      adminCode: form.adminCode.trim()
    })

    // Redirigir según el rol
    const target = authStore.getRoleHomeRoute(user.role)
    await navigateTo(target)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'No se pudo completar el registro.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.admin-auth-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background-color: var(--bg-main);
  padding: 32px 20px;
  position: relative;
}

.top-nav {
  position: absolute;
  top: 24px;
  right: 24px;
}

.register-card {
  width: min(100%, 640px);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.register-header {
  text-align: center;
}

.brand-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(200, 157, 124, 0.12);
  color: var(--primary);
  font-weight: 700;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
  font-size: 0.85rem;
}

.register-header h1 {
  color: var(--text-title);
  font-size: clamp(1.8rem, 3.5vw, 2.3rem);
  margin-bottom: 6px;
}

.register-header p {
  color: var(--text-body);
  font-size: 0.95rem;
}

/* Selector de Rol */
.role-selector-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-title);
}

.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
}

.role-tile {
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-tile:hover {
  background: var(--bg-card);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.role-tile.active {
  background: rgba(200, 157, 124, 0.12);
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(200, 157, 124, 0.25);
}

.role-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-info strong {
  font-size: 0.95rem;
  color: var(--text-title);
}

.role-info small {
  font-size: 0.78rem;
  color: var(--text-body);
  line-height: 1.3;
}

/* Formulario */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.register-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text-title);
  font-weight: 600;
  font-size: 0.88rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.admin-code-box {
  background: rgba(200, 157, 124, 0.08);
  border: 1px dashed var(--primary);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.admin-hint {
  font-size: 0.78rem;
  color: #c48a14;
  font-weight: 600;
}

.register-submit {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  font-size: 1rem;
}

.admin-error {
  background: rgba(182, 46, 46, 0.08);
  color: #b12a2a;
  border: 1px solid rgba(177, 42, 42, 0.2);
  border-radius: 10px;
  padding: 12px;
  font-size: 0.9rem;
}

.register-footer {
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-body);
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.login-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
}

.login-link:hover {
  text-decoration: underline;
}

@media (max-width: 540px) {
  .register-card {
    padding: 24px 18px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
