export function normalizeRole(role) {
  return role === 'CLIENT' ? 'ROLE_CLIENT' : role?.startsWith('ROLE_') ? role : `ROLE_${role || ''}`
}

export function isRoleAllowed(role, allowedRoles = []) {
  return allowedRoles.includes(normalizeRole(role))
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
