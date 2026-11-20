import { useEffect, useState } from 'react'
import { CalendarDays, FileText, LoaderCircle, Plus, ShieldCheck, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { documentBusApi, maintenanceApi } from '@api/index'

const money = new Intl.NumberFormat('fr-FR')
const today = new Date().toISOString().slice(0, 10)
const initialForm = { idBus: '', dateMaintenance: today, natureIntervention: '', coutInterventionXaf: '', kilometrageAuMoment: '', observationsMecano: '' }

export default function MaintenancePage() {
  const [fiches, setFiches] = useState([])
  const [bus, setBus] = useState([])
  const [documents, setDocuments] = useState([])
  const [typesDocument, setTypesDocument] = useState([])
  const [form, setForm] = useState(initialForm)
  const [documentForm, setDocumentForm] = useState({ idBus: '', idTypeDoc: '', numeroPiece: '', dateEmission: today, dateExpiration: '', fichierScan: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingDocument, setSavingDocument] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showDocumentForm, setShowDocumentForm] = useState(false)
  const [activeTab, setActiveTab] = useState('interventions')

  const load = async () => {
    setLoading(true)
    const results = await Promise.allSettled([
        maintenanceApi.getFiches(), maintenanceApi.getBus(), documentBusApi.getDocuments(), documentBusApi.getTypes(),
    ])
    const read = (index) => results[index].status === 'fulfilled' ? results[index].value.data?.data || [] : null
    const interventions = read(0)
    const fleet = read(1)
    const docs = read(2)
    const types = read(3)
    if (interventions) setFiches(interventions)
    if (fleet) {
      setBus(fleet)
      setForm((current) => ({ ...current, idBus: current.idBus || fleet[0]?.idBus || '' }))
    }
    if (docs) setDocuments(docs)
    if (types) {
      setTypesDocument(types)
      setDocumentForm((current) => ({ ...current, idBus: current.idBus || fleet?.[0]?.idBus || '', idTypeDoc: current.idTypeDoc || types[0]?.idTypeDoc || '' }))
    }
    const failed = results.find((result) => result.status === 'rejected')
    if (failed) toast.error(failed.reason?.response?.data?.message || 'Certaines données de maintenance ne sont pas accessibles.')
    setLoading(false)
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

  const submitDocument = async (event) => {
    event.preventDefault(); setSavingDocument(true)
    try {
      const response = await documentBusApi.enregistrer({ ...documentForm, fichierScan: documentForm.fichierScan.trim() || null })
      setDocuments((current) => [...current.filter((item) => item.idDocument !== response.data?.data?.idDocument), response.data?.data].filter(Boolean).sort((a, b) => String(a.dateExpiration).localeCompare(String(b.dateExpiration))))
      setDocumentForm((current) => ({ ...current, numeroPiece: '', dateEmission: today, dateExpiration: '', fichierScan: '' }))
      setShowDocumentForm(false)
      toast.success('Document du bus enregistré.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible d’enregistrer le document.')
    } finally { setSavingDocument(false) }
  }

  return (
    <div className="maintenance-page">
      <header className="office-heading"><div><div className="office-eyebrow">PARC ROULANT · HISTORIQUE RÉEL</div><h1>Maintenance</h1><p>Consultez les interventions et les échéances réglementaires des bus.</p></div>{activeTab === 'interventions' && <button className="maintenance-add" onClick={() => setShowForm((value) => !value)} disabled={!bus.length}><Plus size={16} /> Nouvelle intervention</button>}{activeTab === 'documents' && <button className="maintenance-add" onClick={() => setShowDocumentForm((value) => !value)} disabled={!bus.length || !typesDocument.length}><Plus size={16} /> Ajouter un document</button>}</header>

      <nav className="maintenance-tabs" aria-label="Sections maintenance"><button type="button" className={activeTab === 'interventions' ? 'is-active' : ''} onClick={() => setActiveTab('interventions')}><Wrench size={15} /> Interventions</button><button type="button" className={activeTab === 'documents' ? 'is-active' : ''} onClick={() => setActiveTab('documents')}><FileText size={15} /> Documents bus <span>{documents.filter((item) => item.etatEcheance !== 'HORS_FENETRE_30_JOURS').length}</span></button></nav>

      {activeTab === 'interventions' && showForm && <form className="maintenance-form" onSubmit={submit}><div className="maintenance-form-title"><Wrench size={17} /><div><strong>Enregistrer une intervention</strong><span>Les données seront associées à votre compagnie.</span></div></div><div className="maintenance-fields"><label>Bus<select required value={form.idBus} onChange={(event) => setForm({ ...form, idBus: event.target.value })}><option value="">Sélectionner un bus</option>{bus.map((item) => <option key={item.idBus} value={item.idBus}>{item.immatriculation} · {item.marque} {item.modele || ''}</option>)}</select></label><label>Date<input type="date" required value={form.dateMaintenance} onChange={(event) => setForm({ ...form, dateMaintenance: event.target.value })} /></label><label>Nature de l’intervention<input maxLength={100} required value={form.natureIntervention} onChange={(event) => setForm({ ...form, natureIntervention: event.target.value })} /></label><label>Coût (FCFA)<input type="number" min="0" step="1" required value={form.coutInterventionXaf} onChange={(event) => setForm({ ...form, coutInterventionXaf: event.target.value })} /></label><label>Kilométrage<input type="number" min="0" step="1" required value={form.kilometrageAuMoment} onChange={(event) => setForm({ ...form, kilometrageAuMoment: event.target.value })} /></label><label className="maintenance-observations">Observations<textarea value={form.observationsMecano} onChange={(event) => setForm({ ...form, observationsMecano: event.target.value })} /></label></div><div className="maintenance-form-actions"><button type="button" onClick={() => setShowForm(false)}>Annuler</button><button type="submit" disabled={saving || !bus.length}>{saving ? <><LoaderCircle className="spin" size={15} /> Enregistrement…</> : 'Enregistrer'}</button></div></form>}

      {activeTab === 'interventions' && <section className="maintenance-records"><div className="maintenance-records-heading"><div><CalendarDays size={17} /><h2>Interventions récentes</h2></div><span>{loading ? '…' : `${fiches.length} fiche${fiches.length === 1 ? '' : 's'}`}</span></div>
        {loading ? <div className="office-empty"><LoaderCircle className="spin" /> Chargement des interventions…</div> : fiches.length === 0 ? <div className="office-empty"><Wrench size={20} /> Aucune intervention enregistrée pour cette compagnie.</div> : <div className="maintenance-list">{fiches.map((item) => <article className="maintenance-record" key={item.idMaintenance}><div className="maintenance-bus-mark"><Wrench size={17} /></div><div className="maintenance-record-main"><div className="maintenance-record-top"><strong>{item.immatriculation}</strong><span>{item.marque} {item.modele}</span></div><h3>{item.natureIntervention}</h3><p>{item.dateMaintenance ? new Date(`${item.dateMaintenance}T00:00:00`).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : 'Date non renseignée'} · {item.kilometrageAuMoment?.toLocaleString('fr-FR')} km · {item.mecanicien}</p>{item.observationsMecano && <small>{item.observationsMecano}</small>}</div><div className="maintenance-cost">{money.format(item.coutInterventionXaf || 0)}<small>FCFA</small></div></article>)}</div>}
      </section>}

      {activeTab === 'documents' && <section className="maintenance-records bus-documents-panel"><div className="maintenance-records-heading"><div><FileText size={17} /><h2>Documents et échéances bus</h2></div><span>{loading ? '…' : `${documents.length} document${documents.length === 1 ? '' : 's'}`}</span></div>
        {showDocumentForm && <form className="maintenance-form bus-document-form" onSubmit={submitDocument}><div className="maintenance-form-title"><ShieldCheck size={17} /><div><strong>Enregistrer une pièce réglementaire</strong><span>Les alertes d’échéance sont calculées par la vue de la base.</span></div></div><div className="maintenance-fields"><label>Bus<select required value={documentForm.idBus} onChange={(event) => setDocumentForm({ ...documentForm, idBus: event.target.value })}><option value="">Sélectionner un bus</option>{bus.map((item) => <option key={item.idBus} value={item.idBus}>{item.immatriculation} · {item.marque} {item.modele || ''}</option>)}</select></label><label>Type de document<select required value={documentForm.idTypeDoc} onChange={(event) => setDocumentForm({ ...documentForm, idTypeDoc: event.target.value })}><option value="">Sélectionner un type</option>{typesDocument.map((type) => <option value={type.idTypeDoc} key={type.idTypeDoc}>{type.libelleType}</option>)}</select></label><label>Numéro de pièce<input required maxLength={50} value={documentForm.numeroPiece} onChange={(event) => setDocumentForm({ ...documentForm, numeroPiece: event.target.value })} /></label><label>Date d’émission<input type="date" required value={documentForm.dateEmission} onChange={(event) => setDocumentForm({ ...documentForm, dateEmission: event.target.value })} /></label><label>Date d’expiration<input type="date" required min={documentForm.dateEmission} value={documentForm.dateExpiration} onChange={(event) => setDocumentForm({ ...documentForm, dateExpiration: event.target.value })} /></label><label className="maintenance-observations">Chemin du scan (facultatif)<input maxLength={255} value={documentForm.fichierScan} onChange={(event) => setDocumentForm({ ...documentForm, fichierScan: event.target.value })} placeholder="Ex. /documents/assurance.pdf" /></label></div><div className="maintenance-form-actions"><button type="button" onClick={() => setShowDocumentForm(false)}>Annuler</button><button type="submit" disabled={savingDocument || !bus.length || !typesDocument.length}>{savingDocument ? <><LoaderCircle className="spin" size={15} /> Enregistrement…</> : 'Enregistrer le document'}</button></div></form>}
        {loading ? <div className="office-empty"><LoaderCircle className="spin" /> Chargement des documents…</div> : documents.length === 0 ? <div className="office-empty"><FileText size={20} /> Aucun document de bus enregistré.</div> : <div className="bus-documents-table-wrap"><table className="bus-documents-table"><thead><tr><th>Bus</th><th>Document</th><th>Émis le</th><th>Expire le</th><th>État</th></tr></thead><tbody>{documents.map((item) => { const expired = item.etatEcheance === 'EXPIRE' || !item.estValide; const soon = item.etatEcheance === 'A_RENOUVELER_DANS_30_JOURS'; return <tr key={item.idDocument}><td><strong>{item.immatriculation}</strong><small>{item.marque} {item.modele || ''}</small></td><td>{item.libelleType}<small>{item.codeType}</small></td><td>{item.dateEmission}</td><td>{item.dateExpiration}</td><td><span className={`document-status ${expired ? 'is-expired' : soon ? 'is-soon' : 'is-valid'}`}>{expired ? 'Expiré / invalide' : soon ? `${item.joursAvantExpiration} j · à renouveler` : 'À jour'}</span></td></tr> })}</tbody></table></div>}
      </section>}
    </div>
  )
}
