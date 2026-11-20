export function normalizeRole(role) {
  return role === 'CLIENT' ? 'ROLE_CLIENT' : role?.startsWith('ROLE_') ? role : `ROLE_${role || ''}`
}

export function isRoleAllowed(role, allowedRoles = []) {
  return allowedRoles.includes(normalizeRole(role))
}

export const STAFF_ROLES = [
  'ROLE_ADMIN',
  'ROLE_CHEF_AGENCE',
  'ROLE_GUICHETIER',
  'ROLE_HOTESSE',
  'ROLE_CHAUFFEUR',
  'ROLE_MECANICIEN',
  'ROLE_COMPTABLE',
]

const ROLE_HOME_PATHS = {
  ROLE_ADMIN: '/app',
  ROLE_CHEF_AGENCE: '/app/billetterie',
  ROLE_GUICHETIER: '/app/billetterie',
  ROLE_HOTESSE: '/app/embarquement',
  ROLE_CHAUFFEUR: '/app/chauffeur',
  ROLE_MECANICIEN: '/app/maintenance',
  ROLE_COMPTABLE: '/app/caisse',
  ROLE_CLIENT: '/mon-espace',
}

const STAFF_PATH_ROLES = {
  '/app': STAFF_ROLES,
  '/app/billetterie': ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER'],
  '/app/colis': ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER'],
  '/app/caisse': ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER', 'ROLE_COMPTABLE'],
  '/app/gps': ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE'],
  '/app/maintenance': ['ROLE_ADMIN', 'ROLE_MECANICIEN'],
  '/app/embarquement': ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_HOTESSE'],
  '/app/chauffeur': ['ROLE_CHAUFFEUR'],
  '/app/equipage': ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE'],
  '/app/admin': ['ROLE_ADMIN'],
}

export function roleHomePath(role) {
  return ROLE_HOME_PATHS[normalizeRole(role)] || '/'
}

function roleCanOpenPath(role, pathname) {
  const normalizedRole = normalizeRole(role)
  if (normalizedRole === 'ROLE_CLIENT') return ['/mon-espace', '/reserver'].includes(pathname)
  if (!STAFF_ROLES.includes(normalizedRole)) return false
  const allowedRoles = STAFF_PATH_ROLES[pathname]
  return Boolean(allowedRoles?.includes(normalizedRole))
}

/** Keep a requested private URL only when the authenticated role can open it. */
export function authenticatedDestination(role, requestedPath) {
  const fallback = roleHomePath(role)
  const candidate = safeInternalPath(requestedPath, '')
  if (!candidate) return fallback
  const pathname = candidate.split(/[?#]/, 1)[0] || '/'
  return roleCanOpenPath(role, pathname) ? candidate : fallback
}

export function safeInternalPath(value, fallback) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : fallback
}

export function normalizeCmPhone(value = '') {
  let digits = String(value).replace(/\D/g, '')
  if (digits.startsWith('237')) digits = digits.slice(3)
  return digits
}

export function isValidCmMobile(value) {
  return /^6\d{8}$/.test(normalizeCmPhone(value))
}

export function parseCmInstant(value) {
  if (!value) return Number.NaN
  const text = String(value)
  return Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(text) ? text : `${text}+01:00`)
}

export function cashDifference(counted, theoretical) {
  return Number(counted || 0) - Number(theoretical || 0)
}

export function occupancyPercent(occupied, capacity) {
  const total = Number(capacity)
  if (!Number.isFinite(total) || total <= 0) return 0
  return Math.max(0, Math.min(100, (Number(occupied || 0) / total) * 100))
}

export function isSeatSelectable(seat, freeSeats, capacity) {
  const number = Number(seat)
  return Number.isInteger(number) && number > 0 && number <= Number(capacity) && freeSeats.has(number)
}

export function isTicketConfirmed(status) {
  return ['VALIDE', 'EMBARQUE'].includes(String(status || '').toUpperCase())
}
