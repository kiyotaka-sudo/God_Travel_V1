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

export const bagageApi = {
  enregistrer: (data) => api.post('/bagages', data),
  getBagages: (idBillet) => api.get(`/bagages/billet/${idBillet}`),
}

export const siegeApi = {
  verrouiller: (idVoyage, numSiege) => api.post(`/voyages/${idVoyage}/verrouiller-siege`, { numSiege }),
  liberer: (idVoyage, numSiege) => api.delete(`/voyages/${idVoyage}/liberer-siege`, { params: { numSiege } }),
}

export const embarquementApi = {
  getManifeste: (idVoyage) => api.get(`/embarquement/voyage/${idVoyage}`),
  validerEmbarquement: (data) => api.post('/embarquement/valider', data),
}

export const equipageApi = {
  getVoyages: () => api.get('/equipage/voyages'),
  getEmployes: () => api.get('/equipage/employes'),
  getRoles: () => api.get('/equipage/roles'),
  getEquipage: (idVoyage) => api.get(`/equipage/voyage/${idVoyage}`),
  affecter: (idVoyage, data) => api.post(`/equipage/voyage/${idVoyage}`, data),
  retirer: (idVoyage, idEmploye) => api.delete(`/equipage/voyage/${idVoyage}/${idEmploye}`),
}

export const incidentApi = {
  declarer: (data) => api.post('/incidents-route', data),
  getPourVoyage: (idVoyage) => api.get(`/incidents-route/voyage/${idVoyage}`),
  getJour: () => api.get('/incidents-route/jour'),
}

export const chauffeurApi = {
  getMonTrajet: () => api.get('/chauffeur/mon-trajet'),
}

export const colisApi = {
  enregistrerColis: (data) => api.post('/colis', data),
  estimerTarif: (data) => api.post('/colis/estimer-tarif', data),
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

export const fideliteApi = {
  monCompteur: () => api.get('/fidelite/mon-compteur'),
  compteurClient: (idClient) => api.get(`/fidelite/client/${idClient}`),
}

export const packApi = {
  getDisponibles: () => api.get('/packs'),
  souscrire: (data) => api.post('/packs/souscrire', data),
  mesPacks: () => api.get('/packs/mes-packs'),
}

export const promotionApi = {
  verifier: (codePromo) => api.post('/promotions/verifier', { codePromo }),
  lister: () => api.get('/promotions'),
}

export const documentBusApi = {
  getDocuments: () => api.get('/documents-bus'),
  getAlertes: () => api.get('/documents-bus/alertes'),
  enregistrer: (data) => api.post('/documents-bus', data),
  getBus: () => api.get('/documents-bus/bus'),
  getTypes: () => api.get('/documents-bus/types'),
}

export const gpsApi = {
  getPositions: () => api.get('/positions-gps/live'),
  getHistorique: (busId, params) => api.get(`/positions-gps/bus/${busId}`, { params }),
  getAlertes: () => api.get('/positions-gps/alertes'),
  acquitterAlerte: (id) => api.put(`/positions-gps/alertes/${id}/acquitter`),
}

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getStatsBilletterie: () => api.get('/admin/stats/billetterie'),
  getStatsJournalieres: () => api.get('/admin/stats/journalieres'),
  getStatsFidelite: () => api.get('/admin/stats/fidelite'),
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
