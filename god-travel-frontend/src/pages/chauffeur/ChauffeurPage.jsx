import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, BusFront, CalendarClock, Clock3, LoaderCircle, MapPinned, RefreshCw, Route, Send, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { chauffeurApi, incidentApi } from '@api/index'
import { parseCmInstant } from '@utils/domain'

const asData = (response) => response?.data?.data
const TYPES = [
  ['CREVAISON', 'Crevaison'],
  ['PANNE_MOTEUR', 'Panne moteur'],
  ['EMBARRAS_CIRCULATION', 'Embarras de circulation'],
  ['ACCIDENT', 'Accident'],
  ['CONTROLE', 'Contrôle routier'],
]

function formatDate(value) {
  const timestamp = parseCmInstant(value)
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp))
    : 'Horaire non renseigné'
}

function typeLabel(type) {
  return TYPES.find(([code]) => code === type)?.[1] || type?.replaceAll('_', ' ') || 'Incident'
}

export default function ChauffeurPage() {
  const [route, setRoute] = useState(null)
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [incidentsLoading, setIncidentsLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ typeIncident: 'CREVAISON', descriptionDetaillee: '', tempsRetardEstimeMin: '0' })

  const loadIncidents = useCallback(async (idVoyage) => {
    if (!idVoyage) return
    setIncidentsLoading(true)
    try { setIncidents(asData(await incidentApi.getPourVoyage(idVoyage)) || []) }
    catch (requestError) { setError(requestError.response?.data?.message || 'Les incidents de ce voyage ne peuvent pas être chargés.') }
    finally { setIncidentsLoading(false) }
  }, [])

  const loadRoute = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const currentRoute = asData(await chauffeurApi.getMonTrajet())
      setRoute(currentRoute)
      if (currentRoute?.idVoyage) await loadIncidents(currentRoute.idVoyage)
      else setIncidents([])
    } catch (requestError) {
      setRoute(null); setIncidents([])
      setError(requestError.response?.data?.message || 'Impossible de charger votre feuille de route.')
    } finally { setLoading(false) }
  }, [loadIncidents])

  useEffect(() => { loadRoute() }, [loadRoute])

  const submitIncident = async (event) => {
    event.preventDefault()
    if (!route?.idVoyage) return
    setSaving(true); setError('')
    try {
      const created = asData(await incidentApi.declarer({
        idVoyage: route.idVoyage,
        typeIncident: form.typeIncident,
        descriptionDetaillee: form.descriptionDetaillee.trim(),
        tempsRetardEstimeMin: Number(form.tempsRetardEstimeMin),
      }))
      if (created) setIncidents((current) => [created, ...current])
      setForm({ typeIncident: 'CREVAISON', descriptionDetaillee: '', tempsRetardEstimeMin: '0' })
      setShowForm(false)
      toast.success('Incident transmis à l’agence.')
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Impossible de signaler cet incident.'
      setError(message); toast.error(message)
    } finally { setSaving(false) }
  }

  return <div className="chauffeur-page">
    <header className="office-heading"><div><span className="office-eyebrow">CONDUITE · FEUILLE DE ROUTE</span><h1>Mon trajet du jour</h1><p>Les informations de départ et les incidents sont rattachés au voyage qui vous est affecté.</p></div><button type="button" className="icon-link-button" onClick={loadRoute} disabled={loading} aria-label="Actualiser la feuille de route"><RefreshCw size={16} className={loading ? 'spin' : ''} /></button></header>

    {error && <div className="office-alert" role="alert"><AlertTriangle size={16} />{error}<button type="button" aria-label="Fermer" onClick={() => setError('')}>×</button></div>}
    {loading ? <section className="driver-empty"><LoaderCircle className="spin" size={20} /> Chargement de votre feuille de route…</section> : !route ? <section className="driver-empty"><CalendarClock size={24} /><strong>Aucun départ affecté aujourd’hui</strong><span>Votre agence n’a pas encore associé de trajet à votre compte chauffeur.</span></section> : <>
      <section className="driver-route-card">
        <div className="driver-route-top"><span className={`driver-status ${route.statutVoyage === 'EN_COURS' ? 'is-live' : ''}`}><i />{route.statutVoyage === 'EN_COURS' ? 'En cours' : 'Programmé'}</span><span>{route.codeVoyage} · {route.codeLigne}</span></div>
        <div className="driver-route-cities"><div><small>DÉPART</small><strong>{route.villeDepart}</strong><span>{formatDate(route.departPrevu)}</span></div><Route size={22} /><div><small>ARRIVÉE</small><strong>{route.villeArrivee}</strong><span>{formatDate(route.arriveePrevue)}</span></div></div>
        <div className="driver-route-stats"><div><BusFront size={17} /><span>Bus<strong>{route.immatriculationBus || '—'}</strong><small>{route.classeBus || 'Classe non renseignée'}</small></span></div><div><Users size={17} /><span>Passagers prévus<strong>{route.passagersPrevus ?? 0}</strong></span></div><div><Clock3 size={17} /><span>Mon rôle<strong>{route.roleVoyage || 'Équipage'}</strong></span></div></div>
      </section>

      <section className="driver-incidents-section">
        <div className="driver-section-heading"><div><span className="office-eyebrow">SUIVI ROUTIER</span><h2>Incidents du trajet</h2><p>Les signalements sont transmis à l’agence dès leur envoi.</p></div>{route.statutVoyage === 'EN_COURS' ? <button type="button" className="maintenance-add driver-report-button" onClick={() => setShowForm((current) => !current)}><AlertTriangle size={16} />{showForm ? 'Fermer le formulaire' : 'Signaler un incident'}</button> : <span className="driver-report-availability">Le signalement sera disponible au démarrage du trajet.</span>}</div>

        {route.statutVoyage === 'EN_COURS' && showForm && <form className="maintenance-form driver-incident-form" onSubmit={submitIncident}>
          <div className="maintenance-form-title"><AlertTriangle size={17} /><div><strong>Nouveau signalement</strong><span>Précisez la situation pour permettre à l’exploitation de réagir.</span></div></div>
          <div className="maintenance-fields"><label>Type d’incident<select required value={form.typeIncident} onChange={(event) => setForm({ ...form, typeIncident: event.target.value })}>{TYPES.map(([code, label]) => <option value={code} key={code}>{label}</option>)}</select></label><label>Retard estimé (minutes)<input type="number" min="0" max="1440" step="1" required value={form.tempsRetardEstimeMin} onChange={(event) => setForm({ ...form, tempsRetardEstimeMin: event.target.value })} /></label><label className="maintenance-observations">Description<textarea required maxLength={255} rows={3} value={form.descriptionDetaillee} onChange={(event) => setForm({ ...form, descriptionDetaillee: event.target.value })} placeholder="Décrivez le lieu et la situation…" /></label></div>
          <div className="maintenance-form-actions"><button type="button" onClick={() => setShowForm(false)}>Annuler</button><button type="submit" disabled={saving || !form.descriptionDetaillee.trim()}>{saving ? <><LoaderCircle className="spin" size={15} /> Envoi…</> : <><Send size={14} /> Envoyer le signalement</>}</button></div>
        </form>}

        {incidentsLoading ? <div className="driver-empty compact"><LoaderCircle className="spin" size={18} /> Chargement des incidents…</div> : incidents.length === 0 ? <div className="driver-empty compact"><MapPinned size={20} /><strong>Aucun incident signalé</strong><span>Les signalements de ce trajet apparaîtront ici.</span></div> : <div className="driver-incident-list">{incidents.map((incident) => <article className="driver-incident" key={incident.idIncident}><span className="driver-incident-mark"><AlertTriangle size={16} /></span><div className="driver-incident-main"><div><strong>{typeLabel(incident.typeIncident)}</strong><time>{formatDate(incident.dateHeureIncident)}</time></div><p>{incident.descriptionDetaillee}</p></div><span className="driver-delay">+{incident.tempsRetardEstimeMin || 0}<small>min estimées</small></span></article>)}</div>}
      </section>
    </>}
  </div>
}
