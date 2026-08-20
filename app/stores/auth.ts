import { defineStore } from 'pinia'

export type UserRole = 'admin' | 'profesional' | 'proveedor' | 'cliente' | 'staff' | 'receptionist'

export interface UserProfile {
  _id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  businessName?: string
  specialty?: string
  createdAt?: string
  updatedAt?: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  businessName?: string
  specialty?: string
  adminCode?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isProfesional = computed(() => user.value?.role === 'profesional')
  const isProveedor = computed(() => user.value?.role === 'proveedor')
  const isCliente = computed(() => user.value?.role === 'cliente')

  /**
   * Determina la ruta de inicio según el rol del usuario
   */
  const getRoleHomeRoute = (role?: UserRole): string => {
    switch (role) {
      case 'admin':
        return '/admin'
      case 'profesional':
        return '/negocio'
      case 'proveedor':
        return '/proveedor'
      case 'cliente':
      default:
        return '/cliente'
    }
  }

  /**
   * Obtiene la sesión actual desde el servidor usando $fetch
   */
  const fetchUser = async (): Promise<UserProfile | null> => {
    loading.value = true
    try {
      const response = await $fetch<{ success: boolean; user: UserProfile }>('/api/auth/me')
      if (response?.success && response?.user) {
        user.value = response.user
      } else {
        user.value = null
      }
    } catch {
      user.value = null
    } finally {
      loading.value = false
      initialized.value = true
    }
    return user.value
  }

  /**
   * Inicia sesión con correo y contraseña
   */
  const login = async (email: string, password: string): Promise<UserProfile> => {
    loading.value = true
    try {
      const response = await $fetch<{ success: boolean; user: UserProfile; message?: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: { email, password }
        }
      )

      if (!response.success || !response.user) {
        throw new Error(response.message || 'Credenciales inválidas.')
      }

      user.value = response.user
      return user.value
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  /**
   * Registra un nuevo usuario en el sistema con su rol correspondiente
   */
  const register = async (payload: RegisterPayload): Promise<UserProfile> => {
    loading.value = true
    try {
      const response = await $fetch<{ success: boolean; user: UserProfile; message?: string }>(
        '/api/auth/register',
        {
          method: 'POST',
          body: payload
        }
      )

      if (!response.success || !response.user) {
        throw new Error(response.message || 'Error en el registro.')
      }

      user.value = response.user
      return user.value
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  /**
   * Cierra la sesión activa de forma segura y limpia el estado local
   */
  const logout = async (): Promise<void> => {
    loading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (e) {
      console.warn('Error al llamar endpoint de logout en servidor:', e)
    } finally {
      user.value = null
      initialized.value = true
      loading.value = false
      if (import.meta.client) {
        window.location.href = '/admin/login'
      } else {
        await navigateTo('/admin/login')
      }
    }
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    isAdmin,
    isProfesional,
    isProveedor,
    isCliente,
    getRoleHomeRoute,
    fetchUser,
    login,
    register,
    logout
  }
})
