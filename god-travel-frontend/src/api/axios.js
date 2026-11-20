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

const PUBLIC_EXACT_PATHS = new Set([
  '/auth/login',
  '/auth/client/connexion',
  '/auth/client/inscription',
  '/billets/consulter',
  '/colis/suivi',
  '/paiements/monetbil/notify',
  '/paiements/monetbil/statut',
  '/positions-gps/live',
  '/voyages',
  '/v3/api-docs',
  '/swagger-ui',
  '/swagger-ui.html',
  '/ws',
])

function requestPath(config) {
  const rawUrl = config?.url || ''
  try {
    return new URL(rawUrl, window.location.origin).pathname.replace(/^\/api(?=\/|$)/, '').replace(/\/$/, '') || '/'
  } catch {
    return rawUrl.split('?')[0].replace(/^\/api(?=\/|$)/, '').replace(/\/$/, '') || '/'
  }
}

function isPublicPath(path) {
  return PUBLIC_EXACT_PATHS.has(path)
    || /^\/voyages\/[^/]+\/sieges$/.test(path)
    || /^\/colis\/suivi\/[^/]+$/.test(path)
    || path.startsWith('/v3/api-docs/')
    || path.startsWith('/swagger-ui/')
    || path.startsWith('/ws/')
}

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
    const path = requestPath(error.config)
    const isAuthRequest = path.includes('/auth/login') || path.includes('/auth/client/connexion') || path.includes('/auth/client/inscription')
    if (error.response?.status === 401 && useAuthStore.getState().token && !isAuthRequest) {
      const isClient = useAuthStore.getState().user?.role === 'ROLE_CLIENT'
      useAuthStore.getState().logout()
      const returnTo = `${window.location.pathname}${window.location.search}`
      const target = isClient ? '/connexion' : '/login'
      window.location.assign(`${target}?returnTo=${encodeURIComponent(returnTo)}`)
    }
    if (error.response?.status === 403 && path !== '/auth/me' && !isPublicPath(path)) {
      window.dispatchEvent(new CustomEvent('godtravel:forbidden'))
    }
    return Promise.reject(error)
  }
)

export default api

