import { useEffect, useState } from 'react'
import { CalendarDays, LoaderCircle, Plus, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { maintenanceApi } from '@api/index'

const money = new Intl.NumberFormat('fr-FR')
const today = new Date().toISOString().slice(0, 10)
const initialForm = { idBus: '', dateMaintenance: today, natureIntervention: '', coutInterventionXaf: '', kilometrageAuMoment: '', observationsMecano: '' }

export default function MaintenancePage() {
  const [fiches, setFiches] = useState([])
  const [bus, setBus] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [fichesResponse, busResponse] = await Promise.all([maintenanceApi.getFiches(), maintenanceApi.getBus()])
      setFiches(fichesResponse.data?.data || [])
      const fleet = busResponse.data?.data || []
      setBus(fleet)
      setForm((current) => ({ ...current, idBus: current.idBus || fleet[0]?.idBus || '' }))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger les interventions de la compagnie.')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submit = async (event) => {
    event.preventDefault(); setSaving(true)
    try {
      const response = await maintenanceApi.creerFiche({
        ...form,
        coutInterventionXaf: Number(form.coutInterventionXaf),
        kilometrageAuMoment: Number(form.kilometrageAuMoment),
      })
      setFiches((current) => [response.data?.data, ...current])
      setForm({ ...initialForm, idBus: form.idBus })
      setShowForm(false)
      toast.success('Intervention enregistrée dans la base de données.')
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Impossible d’enregistrer cette intervention.')
    } finally { setSaving(false) }
  }

  return (
    <div className="maintenance-page">
      <header className="office-heading"><div><div className="office-eyebrow">PARC ROULANT · HISTORIQUE RÉEL</div><h1>Maintenance</h1><p>Consultez les interventions et documentez les travaux réalisés sur les bus.</p></div><button className="maintenance-add" onClick={() => setShowForm((value) => !value)} disabled={!bus.length}><Plus size={16} /> Nouvelle intervention</button></header>

      {showForm && <form className="maintenance-form" onSubmit={submit}><div className="maintenance-form-title"><Wrench size={17} /><div><strong>Enregistrer une intervention</strong><span>Les données seront associées à votre compagnie.</span></div></div><div className="maintenance-fields"><label>Bus<select required value={form.idBus} onChange={(event) => setForm({ ...form, idBus: event.target.value })}><option value="">Sélectionner un bus</option>{bus.map((item) => <option key={item.idBus} value={item.idBus}>{item.immatriculation} · {item.marque} {item.modele || ''}</option>)}</select></label><label>Date<input type="date" required value={form.dateMaintenance} onChange={(event) => setForm({ ...form, dateMaintenance: event.target.value })} /></label><label>Nature de l’intervention<input maxLength={100} required value={form.natureIntervention} onChange={(event) => setForm({ ...form, natureIntervention: event.target.value })} /></label><label>Coût (FCFA)<input type="number" min="0" step="1" required value={form.coutInterventionXaf} onChange={(event) => setForm({ ...form, coutInterventionXaf: event.target.value })} /></label><label>Kilométrage<input type="number" min="0" step="1" required value={form.kilometrageAuMoment} onChange={(event) => setForm({ ...form, kilometrageAuMoment: event.target.value })} /></label><label className="maintenance-observations">Observations<textarea value={form.observationsMecano} onChange={(event) => setForm({ ...form, observationsMecano: event.target.value })} /></label></div><div className="maintenance-form-actions"><button type="button" onClick={() => setShowForm(false)}>Annuler</button><button type="submit" disabled={saving || !bus.length}>{saving ? <><LoaderCircle className="spin" size={15} /> Enregistrement…</> : 'Enregistrer'}</button></div></form>}

      <section className="maintenance-records"><div className="maintenance-records-heading"><div><CalendarDays size={17} /><h2>Interventions récentes</h2></div><span>{loading ? '…' : `${fiches.length} fiche${fiches.length === 1 ? '' : 's'}`}</span></div>
        {loading ? <div className="office-empty"><LoaderCircle className="spin" /> Chargement des interventions…</div> : fiches.length === 0 ? <div className="office-empty"><Wrench size={20} /> Aucune intervention enregistrée pour cette compagnie.</div> : <div className="maintenance-list">{fiches.map((item) => <article className="maintenance-record" key={item.idMaintenance}><div className="maintenance-bus-mark"><Wrench size={17} /></div><div className="maintenance-record-main"><div className="maintenance-record-top"><strong>{item.immatriculation}</strong><span>{item.marque} {item.modele}</span></div><h3>{item.natureIntervention}</h3><p>{item.dateMaintenance ? new Date(`${item.dateMaintenance}T00:00:00`).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : 'Date non renseignée'} · {item.kilometrageAuMoment?.toLocaleString('fr-FR')} km · {item.mecanicien}</p>{item.observationsMecano && <small>{item.observationsMecano}</small>}</div><div className="maintenance-cost">{money.format(item.coutInterventionXaf || 0)}<small>FCFA</small></div></article>)}</div>}
      </section>
    </div>
  )
}
