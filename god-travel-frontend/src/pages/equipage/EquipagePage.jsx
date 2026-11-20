import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, LoaderCircle, Plus, RefreshCw, Trash2, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { equipageApi } from '@api/index'
import { parseCmInstant } from '@utils/domain'

const asData = (response) => response?.data?.data
const initialForm = { idEmploye: '', codeRole: '', observations: '' }

function formatDate(value) {
  const timestamp = parseCmInstant(value)
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp))
    : 'Horaire non renseigné'
}

export default function EquipagePage() {
  const [voyages, setVoyages] = useState([])
  const [voyageId, setVoyageId] = useState('')
  const [roles, setRoles] = useState([])
  const [employes, setEmployes] = useState([])
  const [equipage, setEquipage] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [crewLoading, setCrewLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState('')
  const [error, setError] = useState('')

  const selectedVoyage = useMemo(() => voyages.find((item) => item.idVoyage === voyageId) || null, [voyages, voyageId])
  const availableEmployees = useMemo(() => {
    const assignedIds = new Set(equipage.map((member) => member.idEmploye))
    return employes.filter((employee) => !assignedIds.has(employee.idEmploye))
  }, [employes, equipage])

  const loadInitialData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [tripsResponse, employeesResponse, rolesResponse] = await Promise.all([
        equipageApi.getVoyages(), equipageApi.getEmployes(), equipageApi.getRoles(),
      ])
      const trips = asData(tripsResponse) || []
      const employees = asData(employeesResponse) || []
      const availableRoles = asData(rolesResponse) || []
      setVoyages(trips); setEmployes(employees); setRoles(availableRoles)
      setVoyageId((current) => trips.some((trip) => trip.idVoyage === current) ? current : trips[0]?.idVoyage || '')
      setForm((current) => ({ ...current, idEmploye: employees.some((employee) => employee.idEmploye === current.idEmploye) ? current.idEmploye : employees[0]?.idEmploye || '', codeRole: availableRoles.some((role) => role.codeRole === current.codeRole) ? current.codeRole : availableRoles[0]?.codeRole || '' }))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Impossible de charger les voyages et les employés disponibles.')
    } finally { setLoading(false) }
  }, [])

  const loadCrew = useCallback(async (id) => {
    if (!id) { setEquipage([]); return }
    setCrewLoading(true); setError('')
    try { setEquipage(asData(await equipageApi.getEquipage(id)) || []) }
    catch (requestError) { setEquipage([]); setError(requestError.response?.data?.message || 'Impossible de charger l’équipage du voyage.') }
    finally { setCrewLoading(false) }
  }, [])

  useEffect(() => { loadInitialData() }, [loadInitialData])
  useEffect(() => { loadCrew(voyageId) }, [voyageId, loadCrew])

  const addMember = async (event) => {
    event.preventDefault()
    if (!voyageId || !form.idEmploye || !form.codeRole) return
    setSaving(true); setError('')
    try {
      const response = await equipageApi.affecter(voyageId, form)
      const saved = asData(response)
      if (saved) setEquipage((current) => [...current, saved])
      const remaining = availableEmployees.filter((employee) => employee.idEmploye !== form.idEmploye)
      setForm((current) => ({ ...current, idEmploye: remaining[0]?.idEmploye || '' }))
      toast.success('Membre affecté au voyage.')
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Impossible d’affecter ce membre.'
      setError(message); toast.error(message)
    } finally { setSaving(false) }
  }

  const removeMember = async (member) => {
    setRemoving(member.idEmploye); setError('')
    try {
      await equipageApi.retirer(voyageId, member.idEmploye)
      setEquipage((current) => current.filter((item) => item.idEmploye !== member.idEmploye))
      toast.success(`${member.nomComplet} retiré de l’équipage.`)
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Impossible de retirer cette affectation.'
      setError(message); toast.error(message)
    } finally { setRemoving('') }
  }

  return <div className="equipage-page">
    <header className="office-heading"><div><span className="office-eyebrow">EXPLOITATION · AFFECTATIONS</span><h1>Équipage des voyages</h1><p>Constituez l’équipe de bord des départs programmés cette semaine.</p></div><button type="button" className="icon-link-button" onClick={loadInitialData} disabled={loading} aria-label="Actualiser les données"><RefreshCw size={16} className={loading ? 'spin' : ''} /></button></header>
    {error && <div className="office-alert" role="alert">{error}<button type="button" aria-label="Fermer" onClick={() => setError('')}>×</button></div>}
    {loading ? <div className="office-empty equipage-loading"><LoaderCircle className="spin" /> Chargement des voyages et des membres…</div> : <div className="equipage-grid">
      <section className="admin-panel equipage-controls">
        <div className="admin-panel-title"><span className="admin-title-icon"><CalendarDays size={18} /></span><div><h2>Départ à préparer</h2><p>Seuls les voyages encore programmés sont modifiables.</p></div></div>
        <label className="equipage-select-label">Voyage<select value={voyageId} onChange={(event) => setVoyageId(event.target.value)} disabled={!voyages.length}><option value="">Choisir un voyage</option>{voyages.map((trip) => <option value={trip.idVoyage} key={trip.idVoyage}>{formatDate(trip.dateHeureDepartPrevue)} · {trip.villeDepart} → {trip.villeArrivee} · {trip.codeVoyage}</option>)}</select></label>
        {selectedVoyage ? <div className="equipage-trip-summary"><span className="trip-summary-code">{selectedVoyage.codeVoyage}</span><strong>{selectedVoyage.villeDepart}<ArrowRight size={14} />{selectedVoyage.villeArrivee}</strong><span>{formatDate(selectedVoyage.dateHeureDepartPrevue)} · {selectedVoyage.immatriculationBus || 'Bus non renseigné'}</span></div> : <div className="equipage-no-trips"><CalendarDays size={20} /><strong>Aucun voyage à affecter</strong><span>Il n’y a pas de départ au statut « programmé » dans les huit prochains jours.</span></div>}

        <form className="equipage-add-form" onSubmit={addMember}>
          <div className="equipage-form-heading"><Plus size={15} /><strong>Ajouter un membre</strong></div>
          <label>Employé<select required value={form.idEmploye} onChange={(event) => setForm({ ...form, idEmploye: event.target.value })} disabled={!availableEmployees.length || !selectedVoyage}><option value="">Sélectionner un employé</option>{availableEmployees.map((employee) => <option key={employee.idEmploye} value={employee.idEmploye}>{employee.nomComplet} · {employee.fonction}</option>)}</select></label>
          <label>Rôle dans le voyage<select required value={form.codeRole} onChange={(event) => setForm({ ...form, codeRole: event.target.value })} disabled={!roles.length || !selectedVoyage}><option value="">Sélectionner un rôle</option>{roles.map((role) => <option key={role.idRoleVoyage} value={role.codeRole}>{role.libelleRole}</option>)}</select></label>
          <label>Observations<textarea maxLength={255} rows={3} value={form.observations} onChange={(event) => setForm({ ...form, observations: event.target.value })} placeholder="Consignes ou informations utiles…" /></label>
          <button className="admin-submit equipage-submit" type="submit" disabled={saving || !selectedVoyage || !form.idEmploye || !form.codeRole}>{saving ? <><LoaderCircle className="spin" size={15} /> Affectation…</> : <><Plus size={15} /> Affecter le membre</>}</button>
          {form.codeRole?.startsWith('CHAUFFEUR_') && <small className="equipage-driver-note">Le serveur vérifiera le dossier chauffeur et la validité du permis.</small>}
        </form>
      </section>

      <section className="admin-panel equipage-members-panel">
        <div className="admin-panel-title"><span className="admin-title-icon"><Users size={18} /></span><div><h2>Équipe de bord</h2><p>{selectedVoyage ? `${selectedVoyage.codeVoyage} · ${equipage.length} membre${equipage.length === 1 ? '' : 's'}` : 'Sélectionnez un voyage pour voir les affectations.'}</p></div></div>
        {crewLoading ? <div className="office-empty equipage-loading"><LoaderCircle className="spin" /> Chargement de l’équipage…</div> : !selectedVoyage ? <div className="equipage-no-trips"><Users size={20} /><span>Sélectionnez un voyage programmé.</span></div> : equipage.length === 0 ? <div className="equipage-no-trips"><Users size={20} /><strong>Équipage non constitué</strong><span>Ajoutez les chauffeurs et le personnel de bord dans le panneau à gauche.</span></div> : <div className="equipage-table-wrap"><table className="equipage-table"><thead><tr><th>Membre</th><th>Rôle</th><th>Prise de service</th><th aria-label="Actions" /></tr></thead><tbody>{equipage.map((member) => <tr key={member.idEmploye}><td><strong>{member.nomComplet}</strong><small>{member.matricule} · {member.fonction}</small>{member.observations && <small className="equipage-observation">{member.observations}</small>}</td><td><span className={`equipage-role-tag ${member.codeRole?.startsWith('CHAUFFEUR_') ? 'is-driver' : ''}`}>{member.libelleRole}</span></td><td>{member.dateHeurePriseService ? formatDate(member.dateHeurePriseService) : '—'}</td><td><button type="button" className="equipage-remove" onClick={() => removeMember(member)} disabled={removing === member.idEmploye} aria-label={`Retirer ${member.nomComplet}`}>{removing === member.idEmploye ? <LoaderCircle className="spin" size={15} /> : <Trash2 size={15} />}</button></td></tr>)}</tbody></table></div>}
      </section>
    </div>}
  </div>
}
