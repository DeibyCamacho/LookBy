import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.fetchUser()
  }

  if (authStore.user) {
    const targetRoute = authStore.getRoleHomeRoute(authStore.user.role)
    return navigateTo(targetRoute)
  }
})
