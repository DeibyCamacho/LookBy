<template>
  <div class="error-shell">
    <div class="error-card">
      <span class="error-emoji">{{ is404 ? '🔍' : '⚠️' }}</span>
      <h1 class="error-code">{{ error?.statusCode || 404 }}</h1>
      <h2>{{ is404 ? 'Página no encontrada' : 'Ocurrió un error inesperado' }}</h2>
      <p>
        {{ is404
          ? 'La página que buscas no existe o ha sido movida a otra dirección.'
          : (error?.message || 'Ha ocurrido un inconveniente al procesar tu solicitud.')
        }}
      </p>

      <div class="error-actions">
        <button class="btn-primary" @click="handleClearError">Volver al Inicio</button>
        <NuxtLink to="/admin/login" class="btn-secondary">Iniciar Sesión</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error?.statusCode === 404)

const handleClearError = () => {
  clearError({ redirect: '/' })
}
</script>

<style scoped>
.error-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background-color: var(--bg-main);
  padding: 24px;
}

.error-card {
  width: min(100%, 480px);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error-emoji {
  font-size: 3.5rem;
}

.error-code {
  font-size: 3.2rem;
  color: var(--primary);
  line-height: 1;
  margin: 0;
}

.error-card h2 {
  font-size: 1.4rem;
  color: var(--text-title);
  margin: 0;
}

.error-card p {
  color: var(--text-body);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>
