import { useAuthStore } from '../stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.fetchUser()
  }

  // 1. Si no hay sesión activa y la ruta no es de autenticación
  if (!authStore.user) {
    if (to.path !== '/admin/login' && to.path !== '/admin/registro' && to.path !== '/admin/recuperar' && !to.path.startsWith('/admin/reset-password')) {
      return navigateTo('/admin/login')
    }
    return
  }

  const role = authStore.user.role

  // 2. Si el rol es CLIENTE, restringir acceso a paneles administrativos
  if (role === 'cliente') {
    if (to.path.startsWith('/admin') || to.path.startsWith('/negocio') || to.path.startsWith('/proveedor')) {
      return navigateTo('/cliente')
    }
  }

  // 3. Si el rol es PROVEEDOR, restringir a /proveedor
  if (role === 'proveedor') {
    if (to.path.startsWith('/admin') || to.path.startsWith('/negocio')) {
      return navigateTo('/proveedor')
    }
  }

  // 4. Si el rol es PROFESIONAL / NEGOCIO, dirigir al panel de negocio si intenta entrar al dashboard de superadmin
  if (role === 'profesional') {
    if (to.path === '/admin' || to.path === '/admin/') {
      return navigateTo('/negocio')
    }
  }
})
