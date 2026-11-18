import test from 'node:test'
import assert from 'node:assert/strict'
import { cashDifference, isRoleAllowed, isSeatSelectable, isTicketConfirmed, isValidCmMobile, normalizeCmPhone, normalizeRole, occupancyPercent, parseCmInstant, safeInternalPath } from '../src/utils/domain.js'

test('normalise les téléphones camerounais sans retirer le préfixe mobile', () => {
  assert.equal(normalizeCmPhone('+237 699 00 00 00'), '699000000')
  assert.equal(isValidCmMobile('+237 699 00 00 00'), true)
  assert.equal(isValidCmMobile('299000000'), false)
  assert.equal(isValidCmMobile('69900000'), false)
})

test('calcule l’écart entre le comptage physique et le total théorique', () => {
  assert.equal(cashDifference(12_500, 10_000), 2_500)
  assert.equal(cashDifference(8_000, 10_000), -2_000)
})

test('limite le taux d’occupation à une capacité valide et à 100 %', () => {
  assert.equal(occupancyPercent(24, 60), 40)
  assert.equal(occupancyPercent(80, 60), 100)
  assert.equal(occupancyPercent(0, 0), 0)
})

test('un siège n’est sélectionnable que s’il est libre et dans la capacité du bus', () => {
  const free = new Set([1, 7, 12])
  assert.equal(isSeatSelectable(7, free, 60), true)
  assert.equal(isSeatSelectable(8, free, 60), false)
  assert.equal(isSeatSelectable(61, free, 60), false)
})

test('seuls les billets confirmés par le backend sont valides à consulter', () => {
  assert.equal(isTicketConfirmed('VALIDE'), true)
  assert.equal(isTicketConfirmed('EMBARQUE'), true)
  assert.equal(isTicketConfirmed('EN_ATTENTE_PAIEMENT'), false)
  assert.equal(isTicketConfirmed('ANNULE'), false)
})

test('lit les heures sans fuseau comme une heure locale du Cameroun (UTC+1)', () => {
  assert.equal(parseCmInstant('2026-11-18T08:30:00'), Date.parse('2026-11-18T07:30:00Z'))
  assert.equal(parseCmInstant('2026-11-18T08:30:00Z'), Date.parse('2026-11-18T08:30:00Z'))
})

test('normalise les rôles client et respecte les rôles autorisés par une route', () => {
  assert.equal(normalizeRole('CLIENT'), 'ROLE_CLIENT')
  assert.equal(normalizeRole('ADMIN'), 'ROLE_ADMIN')
  assert.equal(isRoleAllowed('ROLE_CLIENT', ['ROLE_CLIENT']), true)
  assert.equal(isRoleAllowed('ROLE_CLIENT', ['ROLE_ADMIN']), false)
})

test('la destination de connexion reste interne à l’application', () => {
  assert.equal(safeInternalPath('/app/caisse?jour=1', '/app'), '/app/caisse?jour=1')
  assert.equal(safeInternalPath('//example.com', '/app'), '/app')
  assert.equal(safeInternalPath('https://example.com', '/app'), '/app')
  assert.equal(safeInternalPath('/\\\\example.com', '/app'), '/app')
})
