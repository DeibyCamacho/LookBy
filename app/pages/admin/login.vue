<template>
  <div class="admin-auth-shell">
    <div class="top-nav">
      <ThemeToggle />
    </div>

    <div class="admin-auth-card">
      <div class="admin-auth-header">
        <span class="admin-badge">LookBy</span>
        <h1>Acceso a administración</h1>
        <p>Inicia sesión para gestionar tu negocio.</p>
      </div>

      <form class="admin-auth-form" @submit.prevent="handleLogin">
        <label>
          <span>Correo electrónico</span>
          <input v-model="email" class="input-field" type="email" placeholder="admin@lookby.com" autocomplete="email" required />
        </label>

        <label>
          <span>Contraseña</span>
          <input v-model="password" class="input-field" type="password" placeholder="••••••••" autocomplete="current-password" required />
        </label>

        <div v-if="error" class="admin-error">{{ error }}</div>

        <button class="btn-primary admin-submit" type="submit" :disabled="submitting">
          {{ submitting ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>

      <div class="admin-auth-actions">
        <NuxtLink to="/admin/registro" class="admin-link highlight">¿No tienes cuenta? Regístrate aquí</NuxtLink>
        <NuxtLink to="/admin/recuperar" class="admin-link">¿Olvidaste tu contraseña?</NuxtLink>
        <NuxtLink to="/" class="admin-link secondary">Volver al inicio</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

definePageMeta({
  middleware: ['admin-guest']
})

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

const handleLogin = async () => {
  error.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    error.value = 'Debes completar todos los campos.'
    return
  }

  submitting.value = true

  try {
    const user = await authStore.login(email.value.trim(), password.value)
    const targetRoute = authStore.getRoleHomeRoute(user.role)
    await navigateTo(targetRoute)
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'Credenciales inválidas.'
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
  padding: 24px;
  position: relative;
}

.top-nav {
  position: absolute;
  top: 24px;
  right: 24px;
}

.admin-auth-card {
  width: min(100%, 440px);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 22px;
  box-shadow: var(--shadow);
  padding: 32px 28px;
}


.admin-auth-header {
  text-align: center;
  margin-bottom: 24px;
}

.admin-badge {
  display: inline-block;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(200, 157, 124, 0.12);
  color: var(--primary-hover);
  font-weight: 700;
  letter-spacing: 0.04em;
  margin-bottom: 12px;
}

.admin-auth-header h1 {
  color: var(--text-title);
  font-size: clamp(2rem, 4vw, 2.4rem);
  margin-bottom: 8px;
}

.admin-auth-header p {
  color: var(--text-body);
  font-size: 0.96rem;
}

.admin-auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.admin-auth-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: var(--text-title);
  font-weight: 600;
}

.admin-submit {
  width: 100%;
  margin-top: 8px;
}

.admin-error {
  background: rgba(182, 46, 46, 0.08);
  color: #b12a2a;
  border: 1px solid rgba(177, 42, 42, 0.2);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 0.9rem;
}

.admin-auth-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.admin-link {
  color: var(--primary-hover);
  text-decoration: none;
  font-weight: 600;
}

.admin-link.secondary {
  color: var(--text-title);
}

@media (max-width: 480px) {
  .admin-auth-card {
    padding: 24px 18px;
  }
}
</style>
