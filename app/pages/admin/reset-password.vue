<template>
  <div class="admin-auth-shell">
    <div class="top-nav">
      <ThemeToggle />
    </div>

    <div class="admin-auth-card">
      <div class="admin-auth-header">
        <span class="admin-badge">LookBy</span>
        <h1>Nueva contraseña</h1>
        <p>Define una contraseña segura para acceder a tu cuenta.</p>
      </div>

      <div v-if="!token" class="admin-error">
        No se ha proporcionado un token de recuperación válido. Por favor solicita un nuevo enlace de recuperación.
        <div style="margin-top: 12px;">
          <NuxtLink to="/admin/recuperar" class="btn-secondary">Solicitar enlace</NuxtLink>
        </div>
      </div>

      <form v-else-if="!completed" class="admin-auth-form" @submit.prevent="handleReset">
        <label>
          <span>Nueva contraseña</span>
          <input
            v-model="password"
            class="input-field"
            type="password"
            placeholder="Mínimo 6 caracteres"
            autocomplete="new-password"
            required
            minlength="6"
          />
        </label>

        <label>
          <span>Confirmar nueva contraseña</span>
          <input
            v-model="confirmPassword"
            class="input-field"
            type="password"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            required
          />
        </label>

        <div v-if="error" class="admin-error">{{ error }}</div>

        <button class="btn-primary admin-submit" type="submit" :disabled="submitting">
          {{ submitting ? 'Restableciendo...' : 'Guardar nueva contraseña' }}
        </button>
      </form>

      <div v-else class="success-box">
        <p class="success-msg">{{ message }}</p>
        <NuxtLink to="/admin/login" class="btn-primary">Iniciar sesión ahora</NuxtLink>
      </div>

      <div class="admin-auth-actions">
        <NuxtLink to="/admin/login" class="admin-link">Volver al inicio de sesión</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin-guest']
})

const route = useRoute()
const token = computed(() => String(route.query.token || '').trim())

const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const message = ref('')
const submitting = ref(false)
const completed = ref(false)

const handleReset = async () => {
  error.value = ''

  if (!password.value || password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden.'
    return
  }

  submitting.value = true

  try {
    const response = await $fetch<{ success: boolean; message: string }>(
      '/api/auth/reset-password',
      {
        method: 'POST',
        body: {
          token: token.value,
          newPassword: password.value
        }
      }
    )

    completed.value = true
    message.value = response.message
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'No se pudo restablecer la contraseña.'
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
  font-size: clamp(1.8rem, 4vw, 2.2rem);
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
  padding: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
}

.success-box {
  background: rgba(138, 154, 134, 0.12);
  border: 1px solid rgba(138, 154, 134, 0.3);
  border-radius: 12px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}

.success-msg {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.5;
}

.admin-auth-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.admin-link {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}
</style>
