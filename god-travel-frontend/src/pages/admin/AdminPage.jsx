import { useEffect, useState } from 'react'
import { Building2, KeyRound, LoaderCircle, ShieldCheck, UserPlus, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@api/index'

const initialForm = { prenom: '', nom: '', numeroCni: '', telephone: '', fonction: '', idAgence: '', login: '', motDePasse: '', codeProfil: '' }

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [agences, setAgences] = useState([])
  const [profils, setProfils] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [usersResponse, agenciesResponse, profilesResponse] = await Promise.all([
        adminApi.getUtilisateurs(), adminApi.getAgences(), adminApi.getProfils(),
      ])
      const nextAgences = agenciesResponse.data?.data ?? []
      const nextProfils = profilesResponse.data?.data ?? []
      setUsers(usersResponse.data?.data ?? [])
      setAgences(nextAgences)
      setProfils(nextProfils)
      setForm((current) => ({
        ...current,
        idAgence: current.idAgence || nextAgences[0]?.idAgence || '',
        codeProfil: current.codeProfil || nextProfils.find((profile) => profile.codeProfil !== 'ROLE_ADMIN')?.codeProfil || '',
      }))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Impossible de charger les comptes et référentiels administratifs.')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await adminApi.creerUtilisateur(form)
      const created = response.data?.data
      if (!created?.idUtilisateur) throw new Error('Le serveur n’a pas confirmé la création du compte.')
      setUsers((current) => [created, ...current])
      setForm((current) => ({ ...initialForm, idAgence: current.idAgence, codeProfil: current.codeProfil }))
      toast.success(`Compte créé pour ${created.nomComplet}.`)
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || 'Création du compte impossible.')
    } finally { setSaving(false) }
  }

  const field = (name, label, props = {}) => (
    <label className="admin-field" key={name}><span>{label}</span><input required value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} {...props} /></label>
  )

  return (
    <div className="admin-page">
      <div className="admin-page-heading"><div><div className="admin-eyebrow">GESTION DES ACCÈS</div><h1>Comptes & habilitations</h1><p>Les rôles sont attribués par un administrateur et appliqués côté serveur.</p></div><div className="admin-total"><Users size={17} /><span>{loading ? '…' : users.length}</span><small>COMPTES</small></div></div>

      <div className="admin-grid">
        <section className="admin-panel admin-create-panel"><div className="admin-panel-title"><div className="admin-title-icon"><UserPlus size={18} /></div><div><h2>Créer un compte employé</h2><p>Le profil définit les accès à l’application.</p></div></div>
          <form onSubmit={submit} className="admin-create-form">
            <div className="admin-form-section">IDENTITÉ PROFESSIONNELLE</div>
            <div className="admin-form-grid">{field('prenom', 'Prénom')}{field('nom', 'Nom')}{field('numeroCni', 'Numéro CNI', { autoComplete: 'off' })}{field('telephone', 'Téléphone', { type: 'tel' })}{field('fonction', 'Fonction')}</div>
            <div className="admin-form-section">RATTACHEMENT & CONNEXION</div>
            <label className="admin-field"><span>Agence</span><select required value={form.idAgence} onChange={(event) => setForm((current) => ({ ...current, idAgence: event.target.value }))}><option value="">Choisir une agence</option>{agences.map((agence) => <option key={agence.idAgence} value={agence.idAgence}>{agence.nomAgence}</option>)}</select></label>
            <label className="admin-field"><span>Profil d’accès</span><select required value={form.codeProfil} onChange={(event) => setForm((current) => ({ ...current, codeProfil: event.target.value }))}><option value="">Choisir un profil</option>{profils.map((profile) => <option key={profile.idProfil} value={profile.codeProfil}>{profile.libelleProfil}</option>)}</select></label>
            <div className="admin-form-grid">{field('login', 'E-mail de connexion', { type: 'email', autoComplete: 'off' })}{field('motDePasse', 'Mot de passe temporaire', { type: 'password', minLength: 10, autoComplete: 'new-password' })}</div>
            <div className="admin-password-note"><KeyRound size={14} /> Minimum 10 caractères. Le mot de passe est haché avant stockage.</div>
            <button className="admin-submit" disabled={saving || loading || !agences.length || !profils.length}>{saving ? <><LoaderCircle className="spin" size={16} /> Création en cours…</> : <>Créer le compte <UserPlus size={16} /></>}</button>
          </form>
        </section>

        <section className="admin-panel admin-users-panel"><div className="admin-panel-title"><div className="admin-title-icon"><ShieldCheck size={18} /></div><div><h2>Utilisateurs enregistrés</h2><p>Un compte n’obtient que son rôle attribué.</p></div></div>
          {loading ? <div className="admin-empty"><LoaderCircle className="spin" /> Chargement des comptes…</div> : users.length === 0 ? <div className="admin-empty">Aucun compte trouvé.</div> : <div className="admin-user-list">{users.map((user) => <article className="admin-user-row" key={user.idUtilisateur}><div className="admin-user-initial">{user.nomComplet?.charAt(0)?.toUpperCase() || 'U'}</div><div className="admin-user-meta"><strong>{user.nomComplet}</strong><span>{user.login}</span><small><Building2 size={12} /> {user.agence}</small></div><div className="admin-user-access"><span className={user.role === 'ROLE_ADMIN' ? 'role-tag role-admin' : 'role-tag'}>{user.role?.replace('ROLE_', '').replaceAll('_', ' ')}</span><i className={user.actif ? 'active-dot' : 'inactive-dot'} title={user.actif ? 'Compte actif' : 'Compte désactivé'} /></div></article>)}</div>}
          <div className="admin-security-note"><ShieldCheck size={17} /><p><strong>Accès admin contrôlé</strong><br />La création et l’attribution du profil administrateur sont réservées aux comptes déjà administrateurs.</p></div>
        </section>
      </div>
    </div>
  )
}
