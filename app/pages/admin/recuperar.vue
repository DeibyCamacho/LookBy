<template>
  <div class="admin-auth-shell">
    <div class="top-nav">
      <ThemeToggle />
    </div>

    <div class="admin-auth-card">
      <div class="admin-auth-header">
        <span class="admin-badge">LookBy</span>
        <h1>Recuperar contraseña</h1>
        <p>Ingresa tu correo registrado para recibir las instrucciones de restablecimiento.</p>
      </div>

      <form v-if="!submitted" class="admin-auth-form" @submit.prevent="handleRecover">
        <label>
          <span>Correo electrónico</span>
          <input
            v-model="email"
            class="input-field"
            type="email"
            placeholder="admin@lookby.com"
            autocomplete="email"
            required
          />
        </label>

        <div v-if="error" class="admin-error">{{ error }}</div>

        <button class="btn-primary admin-submit" type="submit" :disabled="submitting">
          {{ submitting ? 'Enviando instrucciones...' : 'Enviar instrucciones' }}
        </button>
      </form>

      <div v-else class="success-box">
        <p class="success-msg">{{ message }}</p>

        <div v-if="devResetUrl" class="dev-box">
          <small><strong>Modo Desarrollo:</strong> Puedes restablecer tu contraseña directamente desde aquí:</small>
          <NuxtLink :to="devResetUrl" class="btn-secondary dev-btn">Ir al enlace de restablecimiento</NuxtLink>
        </div>
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

const email = ref('')
const error = ref('')
const message = ref('')
const devResetUrl = ref('')
const submitting = ref(false)
const submitted = ref(false)

const handleRecover = async () => {
  error.value = ''

  if (!email.value.trim()) {
    error.value = 'Por favor ingresa tu correo electrónico.'
    return
  }

  submitting.value = true

  try {
    const response = await $fetch<{ success: boolean; message: string; devResetUrl?: string }>(
      '/api/auth/recover',
      {
        method: 'POST',
        body: { email: email.value.trim() }
      }
    )

    submitted.value = true
    message.value = response.message
    if (response.devResetUrl) {
      devResetUrl.value = response.devResetUrl
    }
  } catch (err: any) {
    error.value = err?.data?.statusMessage || err?.message || 'No se pudo procesar la solicitud.'
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
  line-height: 1.6;
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

.success-box {
  background: rgba(138, 154, 134, 0.12);
  border: 1px solid rgba(138, 154, 134, 0.3);
  border-radius: 12px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  text-align: center;
}

.success-msg {
  color: var(--accent);
  font-weight: 600;
  font-size: 0.95rem;
  line-height: 1.5;
}

.dev-box {
  background: var(--bg-card);
  border: 1px dashed var(--primary);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.85rem;
}

.dev-btn {
  font-size: 0.85rem;
  padding: 8px 14px;
  text-align: center;
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
