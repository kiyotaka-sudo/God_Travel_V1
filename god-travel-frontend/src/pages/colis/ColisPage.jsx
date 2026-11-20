import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, LoaderCircle, Package, PackageCheck, Plus, Search, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi, colisApi } from '@api/index'
import { useAuthStore } from '@store/authStore'

const dataOf = (response) => response?.data?.data
const amount = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 })

export default function ColisPage() {
  const role = useAuthStore((state) => state.user?.role)
  const canManage = ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER'].includes(role)
  const [items, setItems] = useState([])
  const [agencies, setAgencies] = useState([])
  const [agencyError, setAgencyError] = useState('')
  const [query, setQuery] = useState('')
  const [tracking, setTracking] = useState('')
  const [tracked, setTracked] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [estimate, setEstimate] = useState(null)
  const [estimateLoading, setEstimateLoading] = useState(false)
  const [estimateError, setEstimateError] = useState('')
  const [estimateAttempt, setEstimateAttempt] = useState(0)
  const [form, setForm] = useState({ nomExpediteur: '', telephoneExpediteur: '', idAgenceRetrait: '', nomDestinataire: '', prenomDestinataire: '', telephoneDestinataire: '', cniDestinataire: '', descriptionContenu: '', poidsKg: '', valeurDeclaree: '' })

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setItems(dataOf(await colisApi.listerColis()) || []) }
    catch (e) { setError(e.response?.data?.message || 'Impossible de charger les colis.'); setItems([]) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!canManage) return
    adminApi.getAgences().then((response) => setAgencies(dataOf(response) || [])).catch((e) => setAgencyError(e.response?.data?.message || 'La liste des agences n’est pas accessible.'))
  }, [canManage])

  useEffect(() => {
    const poids = Number(form.poidsKg)
    const valeur = form.valeurDeclaree === '' ? 0 : Number(form.valeurDeclaree)
    if (!canManage || !form.poidsKg || !Number.isFinite(poids) || poids < 0.1 || !Number.isFinite(valeur) || valeur < 0) {
      setEstimate(null)
      setEstimateLoading(false)
      setEstimateError('')
      return undefined
    }
    let active = true
    setEstimate(null)
    setEstimateLoading(true)
    setEstimateError('')
    const timer = window.setTimeout(async () => {
      try {
        const quote = dataOf(await colisApi.estimerTarif({ poidsKg: poids, valeurDeclaree: valeur }))
        if (active) setEstimate(quote)
      } catch (e) {
        if (active) setEstimateError(e.response?.data?.message || 'Le tarif ne peut pas être estimé pour le moment.')
      } finally {
        if (active) setEstimateLoading(false)
      }
    }, 500)
    return () => { active = false; window.clearTimeout(timer) }
  }, [canManage, estimateAttempt, form.poidsKg, form.valeurDeclaree])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const create = async (event) => {
    event.preventDefault(); setBusy(true); setError('')
    try {
      const request = { ...form, poidsKg: Number(form.poidsKg), valeurDeclaree: form.valeurDeclaree === '' ? null : Number(form.valeurDeclaree) }
      await colisApi.enregistrerColis(request)
      toast.success('Colis enregistré. Le code de suivi est disponible dans la liste.')
      setForm({ nomExpediteur: '', telephoneExpediteur: '', idAgenceRetrait: '', nomDestinataire: '', prenomDestinataire: '', telephoneDestinataire: '', cniDestinataire: '', descriptionContenu: '', poidsKg: '', valeurDeclaree: '' })
      await load()
    } catch (e) { const message = e.response?.data?.message || 'L’enregistrement du colis a échoué.'; setError(message); toast.error(message) }
    finally { setBusy(false) }
  }
  const searchTracking = async (event) => {
    event.preventDefault(); setTracked(null); setError('')
    try { setTracked(dataOf(await colisApi.suivreColis(tracking.trim()))) }
    catch (e) { setError(e.response?.data?.message || 'Aucun colis trouvé pour ce code.') }
  }
  const deliver = async (item) => {
    const cni = window.prompt('Saisissez le numéro de CNI présenté par le destinataire :')
    if (!cni?.trim()) return
    setBusy(true)
    try { await colisApi.remettreColis(item.idColis, { cniDestinataire: cni.trim() }); toast.success('Remise enregistrée.'); await load() }
    catch (e) { const message = e.response?.data?.message || 'La remise n’a pas pu être enregistrée.'; setError(message); toast.error(message) }
    finally { setBusy(false) }
  }

  const visible = items.filter((item) => [item.codeSuivi, item.nomDestinataire, item.descriptionContenu, item.statutColis].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase()))
  const fields = [['nomExpediteur', 'Nom de l’expéditeur'], ['telephoneExpediteur', 'Téléphone expéditeur'], ['nomDestinataire', 'Nom du destinataire'], ['prenomDestinataire', 'Prénom destinataire'], ['telephoneDestinataire', 'Téléphone destinataire'], ['cniDestinataire', 'CNI du destinataire']]
  return <main className="admin-page parcels-page"><header className="admin-page-heading"><div><span className="admin-eyebrow">SERVICE FRET</span><h1>Colis & suivi</h1><p>Enregistrements et statuts récupérés depuis l’API.</p></div></header>
    {error && <div className="office-alert" role="alert">{error}</div>}
    <section className="parcel-tracking-card"><div><span className="admin-eyebrow">SUIVI CLIENT</span><h2>Retrouver un colis</h2><p>Le code de suivi permet de consulter le statut retourné par le serveur.</p></div><form onSubmit={searchTracking}><label htmlFor="tracking-code">Code de suivi<input id="tracking-code" required value={tracking} onChange={(e) => setTracking(e.target.value.toUpperCase())} placeholder="TRK-…" /></label><button className="button-primary"><Search size={15} /> Suivre</button></form>{tracked && <div className="parcel-tracking-result"><PackageCheck size={18} /><strong>{tracked.codeSuivi}</strong><span>{tracked.statutColis}</span><span>{tracked.descriptionContenu}</span></div>}</section>
    {canManage && <section className="admin-panel parcel-create-panel"><div className="panel-heading"><div><span className="admin-eyebrow">NOUVEL ENVOI</span><h2>Enregistrer un colis</h2></div><Plus size={18} /></div>{agencyError && <p className="office-alert">{agencyError}</p>}<form className="parcel-create-form" onSubmit={create}><div className="parcel-form-grid">{fields.map(([key, label]) => <label key={key}>{label}<input required={key !== 'prenomDestinataire'} value={form[key]} onChange={(e) => update(key, e.target.value)} /></label>)}<label>Agence de retrait<select required value={form.idAgenceRetrait} onChange={(e) => update('idAgenceRetrait', e.target.value)}><option value="">Choisir une agence</option>{agencies.map((agency) => <option key={agency.idAgence} value={agency.idAgence}>{agency.nomAgence}</option>)}</select></label><label>Description<input required value={form.descriptionContenu} onChange={(e) => update('descriptionContenu', e.target.value)} /></label><label>Poids (kg)<input required min="0.1" step="0.1" type="number" value={form.poidsKg} onChange={(e) => update('poidsKg', e.target.value)} /></label><label>Valeur déclarée (XAF)<input min="0" step="1" type="number" value={form.valeurDeclaree} onChange={(e) => update('valeurDeclaree', e.target.value)} /></label></div><section className="parcel-quote" aria-live="polite"><div className="parcel-quote-heading"><div><span className="admin-eyebrow">TARIF CALCULÉ PAR LE SERVEUR</span><h3>Estimation du fret</h3></div>{estimateLoading && <LoaderCircle size={17} className="spin" aria-label="Calcul en cours" />}</div>{estimateError ? <div className="parcel-quote-error" role="alert">{estimateError} <button type="button" onClick={() => setEstimateAttempt((attempt) => attempt + 1)}>Réessayer</button></div> : estimate ? <div className="parcel-quote-breakdown"><div><span>Forfait de prise en charge</span><strong>{amount.format(estimate.tarifBaseXaf)} XAF</strong></div><div><span>Poids · {amount.format(estimate.poidsKg)} kg</span><strong>{amount.format(estimate.tarifPoidsXaf)} XAF</strong></div><div><span>Assurance · valeur déclarée {amount.format(estimate.valeurDeclaree)} XAF</span><strong>{amount.format(estimate.tarifAssuranceXaf)} XAF</strong></div><div className="parcel-quote-total"><span>Total estimé</span><strong>{amount.format(estimate.totalXaf)} XAF</strong></div></div> : <p className="parcel-quote-hint">Saisissez le poids pour afficher le détail du tarif.</p>}</section><p className="privacy-note">Le tarif définitif est recalculé par le serveur à l’enregistrement.</p><button className="button-primary" disabled={busy || estimateLoading || !estimate || !canManage || agencies.length === 0}>{busy ? 'Enregistrement…' : 'Enregistrer le colis'} <ArrowRight size={15} /></button></form></section>}
    <section className="admin-panel parcel-list-panel"><div className="panel-heading"><div><span className="admin-eyebrow">REGISTRE</span><h2>Colis enregistrés</h2></div><div className="parcel-list-tools"><span>{visible.length} élément(s)</span><input aria-label="Filtrer les colis" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Code, destinataire, statut" /></div></div>{loading ? <div className="admin-empty"><LoaderCircle className="spin" /> Chargement des colis…</div> : error && items.length === 0 ? <div className="admin-empty">{error}</div> : visible.length ? <div className="parcel-list">{visible.map((item) => <article className="parcel-row" key={item.idColis}><div className="parcel-row-icon"><Package size={18} /></div><div className="parcel-row-main"><strong>{item.codeSuivi}</strong><span>{item.descriptionContenu || 'Description non fournie'}</span><small>{item.nomDestinataire} · {item.telephoneDestinataire}</small></div><div className="parcel-row-meta"><span>{item.statutColis}</span><small>{item.poidsKg} kg · {amount.format(item.fraisExpeditionXaf || 0)} XAF</small></div>{canManage && item.statutColis !== 'LIVRE' && <button type="button" className="icon-link-button" onClick={() => deliver(item)} disabled={busy} aria-label={`Remettre le colis ${item.codeSuivi}`}><Truck size={16} /></button>}</article>)}</div> : <div className="admin-empty"><Package size={21} />Aucun colis ne correspond à ce filtre.</div>}</section>
  </main>
}
