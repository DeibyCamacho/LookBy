<template>
  <button
    type="button"
    class="theme-toggle-btn"
    :title="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    @click="toggleTheme"
  >
    <span v-if="isDark" class="toggle-icon">☀️</span>
    <span v-else class="toggle-icon">🌙</span>
    <span class="toggle-text">{{ isDark ? 'Modo Día' : 'Modo Noche' }}</span>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: (val: boolean) => {
    colorMode.preference = val ? 'dark' : 'light'
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>

<style scoped>
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--bg-card);
  color: var(--text-title);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle-btn:hover {
  background-color: var(--bg-subtle);
  border-color: var(--primary);
  transform: translateY(-1px);
}

.toggle-icon {
  font-size: 1rem;
  line-height: 1;
}

.toggle-text {
  user-select: none;
}
</style>
