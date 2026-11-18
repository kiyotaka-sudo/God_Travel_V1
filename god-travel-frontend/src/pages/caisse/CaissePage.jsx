import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, Clock3, LoaderCircle, LockKeyhole, RefreshCw, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { caisseApi } from '@api/index'
import { useAuthStore } from '@store/authStore'
import { cashDifference } from '@utils/domain'

const dataOf = (response) => response?.data?.data
const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

export default function CaissePage() {
  const role = useAuthStore((state) => state.user?.role)
  const canOpen = ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER'].includes(role)
  const canClose = ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE'].includes(role)
  const canReadReports = ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_COMPTABLE'].includes(role)
  const [session, setSession] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [reports, setReports] = useState([])
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const jobs = []
    if (role !== 'ROLE_COMPTABLE') jobs.push(caisseApi.getSessionActive().then((response) => dataOf(response)).then(setSession).catch((e) => { setSession(null); setError(e.response?.data?.message || 'La session active n’est pas disponible.') }))
    if (canReadReports) jobs.push(caisseApi.getReleves().then((response) => setReports(dataOf(response) || [])).catch((e) => setError(e.response?.data?.message || 'Les relevés ne sont pas disponibles.')))
    await Promise.all(jobs)
    setLoading(false)
  }, [role, canReadReports])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!session?.idCloture) { setTransactions([]); return }
    let active = true
    caisseApi.getTransactions(session.idCloture).then((response) => { if (active) setTransactions(dataOf(response) || []) }).catch((e) => { if (active) setError(e.response?.data?.message || 'Les transactions de cette session ne sont pas disponibles.') })
    return () => { active = false }
  }, [session?.idCloture])

  const open = async () => {
    setBusy(true); setError('')
    try { await caisseApi.ouvrirSession(); toast.success('Session de caisse ouverte.'); await load() }
    catch (e) { const message = e.response?.data?.message || 'Impossible d’ouvrir une session.'; setError(message); toast.error(message) }
    finally { setBusy(false) }
  }
  const close = async (event) => {
    event.preventDefault()
    if (!session?.idCloture || amount === '') { setError('Saisissez le montant réellement compté pour clôturer la session.'); return }
    setBusy(true); setError('')
    try { await caisseApi.fermerSession(session.idCloture, { montantPhysique: Number(amount), observations: notes }); toast.success('Clôture enregistrée.'); setAmount(''); setNotes(''); await load() }
    catch (e) { const message = e.response?.data?.message || 'La clôture n’a pas abouti.'; setError(message); toast.error(message) }
    finally { setBusy(false) }
  }

  return <main className="cash-page"><header className="office-heading"><div><span className="office-eyebrow">ESPACE FINANCIER</span><h1>Caisse & clôtures</h1><p>Les montants et mouvements proviennent des sessions enregistrées par le backend.</p></div><button type="button" className="cash-refresh" onClick={load} disabled={loading}><RefreshCw size={15} className={loading ? 'spin' : ''} /> Actualiser</button></header>
    {error && <div className="office-alert" role="alert"><AlertCircle size={16} />{error}</div>}
    {role !== 'ROLE_COMPTABLE' && <section className="cash-session-panel"><div className="panel-heading"><div><span className="office-eyebrow">SESSION DU JOUR</span><h2>{session?.idCloture ? 'Session ouverte' : 'Aucune session ouverte'}</h2></div><span className={`office-cash-state ${session?.idCloture ? 'is-open' : ''}`}><i />{session?.idCloture ? 'EN COURS' : 'FERMÉE'}</span></div>
      {loading ? <div className="office-empty"><LoaderCircle className="spin" /> Chargement de la caisse…</div> : session?.idCloture ? <><div className="cash-session-summary"><div><span>Agence</span><strong>{session.nomAgence || '—'}</strong></div><div><span>Ouverture</span><strong>{session.heureOuverture || '—'}</strong></div><div><span>Total encaissé</span><strong>{money.format(session.montantTheoriqueXaf || 0)} XAF</strong></div><div><span>Mouvements</span><strong>{transactions.length}</strong></div></div>{canClose && <form className="cash-close-form" onSubmit={close}><label htmlFor="cash-counted">Montant compté (XAF)<input id="cash-counted" required min="0" step="1" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></label><label htmlFor="cash-notes">Observations<textarea id="cash-notes" rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Écart constaté ou commentaire utile" /></label><div className="cash-difference">Écart estimé <strong>{amount === '' ? '—' : `${money.format(cashDifference(amount, session.montantTheoriqueXaf))} XAF`}</strong><small>Montant compté − montant théorique</small></div><button className="button-primary" type="submit" disabled={busy}>{busy ? 'Clôture…' : 'Clôturer la session'}</button></form>}</> : canOpen ? <div className="cash-open-state"><div><LockKeyhole size={19} /><span>La caisse doit être ouverte avant une vente en espèces.</span></div><button className="button-primary" type="button" onClick={open} disabled={busy}>{busy ? 'Ouverture…' : 'Ouvrir une session'}</button></div> : <div className="office-empty">Aucune session active à consulter.</div>}</section>}
    {role !== 'ROLE_COMPTABLE' && session?.idCloture && <section className="cash-ledger"><div className="cash-ledger-heading"><div><span className="office-eyebrow">JOURNAL DE SESSION</span><h2>Transactions enregistrées</h2></div><span>{transactions.length} mouvement(s)</span></div>{transactions.length ? <div className="cash-table-wrap"><table className="cash-table"><thead><tr><th>Date</th><th>Référence</th><th>Libellé</th><th>Mode</th><th>Statut</th><th>Montant</th></tr></thead><tbody>{transactions.map((item) => <tr key={item.reference}><td>{item.datePaiement ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.datePaiement)) : '—'}</td><td>{item.reference}</td><td>{item.libelle}</td><td>{item.mode}</td><td><span className={`transaction-status ${item.statut === 'VALIDE' ? 'is-valid' : ''}`}>{item.statut}</span></td><td>{money.format(item.montantXaf || 0)} XAF</td></tr>)}</tbody></table></div> : <div className="office-empty"><Wallet size={20} />Aucune transaction enregistrée pour cette session.</div>}</section>}
    {canReadReports && <section className="cash-ledger"><div className="cash-ledger-heading"><div><span className="office-eyebrow">HISTORIQUE</span><h2>Relevés journaliers</h2></div><span>{reports.length} session(s)</span></div>{reports.length ? <div className="cash-table-wrap"><table className="cash-table"><thead><tr><th>Date</th><th>Agence</th><th>Guichetier</th><th>Ouverture</th><th>Fermeture</th><th>Écart</th><th>Validation</th></tr></thead><tbody>{reports.map((report) => <tr key={report.idCloture}><td>{report.dateCloture || '—'}</td><td>{report.nomAgence || '—'}</td><td>{report.nomGuichetier || report.matriculeGuichetier || '—'}</td><td>{report.heureOuverture || '—'}</td><td>{report.heureFermeture || 'Ouverte'}</td><td>{report.ecartConstateXaf == null ? '—' : `${money.format(report.ecartConstateXaf)} XAF`}</td><td>{report.nomChefValidateur || 'Non validée'}</td></tr>)}</tbody></table></div> : <div className="office-empty"><Clock3 size={18} />Aucun relevé disponible.</div>}</section>}
    {canClose && <p className="office-footnote"><CheckCircle2 size={14} />La validation distincte d’une clôture journalière n’est pas encore proposée par l’API.</p>}
  </main>
}
