import api from './axios'

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  loginClient: (credentials) => api.post('/auth/client/connexion', credentials),
  inscrireClient: (details) => api.post('/auth/client/inscription', details),
  me: () => api.get('/auth/me'),
}

export const billetterieApi = {
  getVoyages: () => api.get('/voyages'),
  getSiegesLibres: (idVoyage) => api.get(`/voyages/${idVoyage}/sieges`),
  creerBillet: (data) => api.post('/billets', data),
  reserverEnLigne: (data) => api.post('/billets/client', data),
  mesBillets: () => api.get('/billets/mes-billets'),
  consulterBillet: (codeBillet, telephone) => api.get('/billets/consulter', { params: { codeBillet, telephone } }),
  annulerBillet: (idBillet) => api.put(`/billets/${idBillet}/annuler`),
  getQrCode: (codeBillet) => api.get(`/billets/${codeBillet}/qr`, { responseType: 'blob' }),
}

export const colisApi = {
  enregistrerColis: (data) => api.post('/colis', data),
  listerColis: (statut) => api.get('/colis', { params: statut ? { statut } : {} }),
  suivreColis: (codeSuivi) => api.get(`/colis/suivi/${encodeURIComponent(codeSuivi)}`),
  remettreColis: (idColis, data) => api.put(`/colis/${idColis}/remise`, data),
}

export const caisseApi = {
  getSessionActive: () => api.get('/sessions-caisse/active'),
  ouvrirSession: () => api.post('/sessions-caisse/ouvrir'),
  getReleves: () => api.get('/sessions-caisse/releves'),
  getTransactions: (id) => api.get(`/sessions-caisse/${id}/paiements`),
  fermerSession: (id, data) => api.put(`/sessions-caisse/${id}/fermer`, data),
}

export const gpsApi = {
  getPositions: () => api.get('/positions-gps/live'),
  getHistorique: (busId, params) => api.get(`/positions-gps/bus/${busId}`, { params }),
  getAlertes: () => api.get('/positions-gps/alertes'),
}

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getCompagnies: () => api.get('/admin/compagnies'),
  getAgences: () => api.get('/admin/agences'),
  getVilles: () => api.get('/admin/villes'),
  getLignes: () => api.get('/admin/lignes'),
  getBus: () => api.get('/admin/bus'),
  getUtilisateurs: () => api.get('/admin/utilisateurs'),
  getProfils: () => api.get('/admin/profils'),
  creerUtilisateur: (data) => api.post('/admin/utilisateurs', data),
}

export const paymentApi = {
  initierMonetbil: (data) => api.post('/paiements/monetbil/initier', data),
  getStatutMonetbil: (reference, telephone) => api.get('/paiements/monetbil/statut', { params: { reference, telephone } }),
}

export const maintenanceApi = {
  getFiches: () => api.get('/maintenance'),
  getBus: () => api.get('/maintenance/bus'),
  creerFiche: (data) => api.post('/maintenance', data),
}
