import axios from 'axios'
import { useAuthStore } from '@store/authStore'

/**
 * Instance Axios centrale — God Travel API
 * Toutes les requêtes passent par ici.
 * Base URL = /api (proxié vers Spring Boot :8080 par Vite)
 */
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Intercepteur requête → injecte le token JWT automatiquement
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Intercepteur réponse → déconnexion si 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const path = error.config?.url || ''
    const isAuthRequest = path.includes('/auth/login') || path.includes('/auth/client/connexion') || path.includes('/auth/client/inscription')
    if (error.response?.status === 401 && useAuthStore.getState().token && !isAuthRequest) {
      const isClient = useAuthStore.getState().user?.role === 'ROLE_CLIENT'
      useAuthStore.getState().logout()
      const returnTo = `${window.location.pathname}${window.location.search}`
      const target = isClient ? '/connexion' : '/login'
      window.location.assign(`${target}?returnTo=${encodeURIComponent(returnTo)}`)
    }
    if (error.response?.status === 403) window.dispatchEvent(new CustomEvent('godtravel:forbidden'))
    return Promise.reject(error)
  }
)

export default api

