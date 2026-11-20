import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bus, FileWarning, LoaderCircle, MapPinned, Package, Ticket, Users, Wallet } from 'lucide-react'
import { adminApi, billetterieApi, documentBusApi } from '@api/index'
import { useAuthStore } from '@store/authStore'

const dataOf = (response) => response?.data?.data
const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const number = new Intl.NumberFormat('fr-FR')
const percent = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
const day = (value) => value ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`)) : '—'
const departureDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [occupancy, setOccupancy] = useState([])
  const [daily, setDaily] = useState([])
  const [loyalty, setLoyalty] = useState([])
  const [documentAlerts, setDocumentAlerts] = useState([])
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.allSettled([
      adminApi.getStatsBilletterie(), adminApi.getStatsJournalieres(), adminApi.getStatsFidelite(),
      documentBusApi.getAlertes(), billetterieApi.getVoyages(),
    ]).then((results) => {
      if (!active) return
      const read = (index) => results[index].status === 'fulfilled' ? dataOf(results[index].value) || [] : []
      setOccupancy(read(0)); setDaily(read(1)); setLoyalty(read(2)); setDocumentAlerts(read(3)); setTrips(read(4))
      if (results.some((result) => result.status === 'rejected')) setError('Certains indicateurs ne sont pas accessibles. Vérifiez la disponibilité des vues analytiques et les droits du compte.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const averageFill = useMemo(() => {
    const values = occupancy.map((item) => Number(item.tauxBilletsEnregistresPct)).filter(Number.isFinite)
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
  }, [occupancy])
  const mostRecentDay = daily[0]?.dateJour
  const recentDaily = daily.filter((item) => item.dateJour === mostRecentDay)
  const alertCount = documentAlerts.length
  const modules = [
    { title: 'Guichet & billetterie', description: 'Ventes et départs publiés.', to: '/app/billetterie', icon: Ticket },
    { title: 'Fret & colis', description: 'Registre, suivi et remise.', to: '/app/colis', icon: Package },
    { title: 'Caisse & clôtures', description: 'Sessions et recettes encaissées.', to: '/app/caisse', icon: Wallet },
    { title: 'Flotte GPS', description: 'Positions reçues par le système.', to: '/app/gps', icon: MapPinned },
    { title: 'Maintenance', description: 'Interventions et documents de flotte.', to: '/app/maintenance', icon: Bus },
  ]

  return <main className="dashboard-home"><header className="dashboard-welcome"><div><span className="dashboard-eyebrow">TABLEAU DE BORD · ADMINISTRATION</span><h1>Bonjour{user?.nomComplet ? `, ${user.nomComplet.split(' ')[0]}` : ''}.</h1><p>Vue de la billetterie, des recettes, de la fidélité et des documents à renouveler.</p></div><Link className="dashboard-user-chip" to="/app/admin"><span>ADMINISTRATION</span><small>Utilisateurs, rôles et référentiels</small></Link></header>
    {error && <div className="dashboard-data-error" role="status">{error}</div>}
    {loading ? <div className="dashboard-loading"><LoaderCircle className="spin" /> Chargement des vues analytiques…</div> : <>
      <section className="dashboard-kpi-grid" aria-label="Indicateurs synthétiques">
        <article><span className="dashboard-kpi-icon"><Bus size={17} /></span><small>Remplissage moyen</small><strong>{averageFill === null ? '—' : `${percent.format(averageFill)} %`}</strong><span>Calculé par voyage</span></article>
        <article><span className="dashboard-kpi-icon"><Wallet size={17} /></span><small>Recettes du {day(mostRecentDay)}</small><strong>{money.format(recentDaily.reduce((sum, item) => sum + Number(item.recetteCombineeDeclareeXaf || 0), 0))} XAF</strong><span>Billetterie + fret déclarés</span></article>
        <article><span className="dashboard-kpi-icon"><Ticket size={17} /></span><small>Billets enregistrés</small><strong>{number.format(occupancy.reduce((sum, item) => sum + Number(item.nbBilletsEnregistres || 0), 0))}</strong><span>Sur les voyages listés</span></article>
        <article className={alertCount ? 'has-alerts' : ''}><span className="dashboard-kpi-icon"><FileWarning size={17} /></span><small>Documents à vérifier</small><strong>{number.format(alertCount)}</strong><span>Expirés ou échéance sous 30 jours</span></article>
      </section>

      <div className="dashboard-analytics-grid">
        <section className="dashboard-analytics-card dashboard-daily-card"><div className="dashboard-analytics-heading"><div><span className="dashboard-eyebrow">RECETTES · VUE JOURNALIÈRE</span><h2>Billetterie et fret</h2></div><span>{recentDaily.length ? day(mostRecentDay) : 'Aucune donnée'}</span></div>{daily.length ? <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Jour</th><th>Agence · ligne</th><th>Billets</th><th>Billetterie</th><th>Fret</th><th>Total</th></tr></thead><tbody>{daily.slice(0, 12).map((item) => <tr key={item.idStat}><td>{day(item.dateJour)}</td><td><strong>{item.nomAgence}</strong><small>{item.codeLigne} · {item.villeDepart} → {item.villeArrivee}</small></td><td>{number.format(item.nbBilletsVendus || 0)}</td><td>{money.format(item.recetteBilletsXaf || 0)}</td><td>{money.format(item.recetteColisXaf || 0)}</td><td><strong>{money.format(item.recetteCombineeDeclareeXaf || 0)} XAF</strong></td></tr>)}</tbody></table></div> : <div className="dashboard-empty">La vue journalière ne contient pas encore de données.</div>}</section>

        <section className="dashboard-analytics-card"><div className="dashboard-analytics-heading"><div><span className="dashboard-eyebrow">FIDÉLITÉ</span><h2>Clients récompensés</h2></div><Users size={17} /></div>{loyalty.length ? <div className="dashboard-ranking">{loyalty.map((item, index) => <article key={`${item.idClient}-${item.typeBilletCumule}`}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{[item.clientPrenom, item.clientNom].filter(Boolean).join(' ') || item.idClient}</strong><small>{item.typeBilletCumule} · {number.format(item.billetsCumules || 0)} billets cumulés</small></div><b>{number.format(item.soldeGratuitsCalcule || 0)} gratuit(s)</b></article>)}</div> : <div className="dashboard-empty">Aucun compteur de fidélité enregistré.</div>}</section>
      </div>

      <section className="dashboard-analytics-card dashboard-occupancy-card"><div className="dashboard-analytics-heading"><div><span className="dashboard-eyebrow">EXPLOITATION · PAR VOYAGE</span><h2>Occupation des départs</h2></div><span>{occupancy.length} voyage(s)</span></div>{occupancy.length ? <div className="dashboard-table-wrap"><table className="dashboard-table"><thead><tr><th>Départ</th><th>Ligne</th><th>Statut</th><th>Places</th><th>Billets</th><th>Occupation</th></tr></thead><tbody>{occupancy.slice(0, 15).map((item) => <tr key={item.idVoyage}><td><strong>{item.codeVoyage}</strong><small>{departureDate(item.dateHeureDepartPrevue)}</small></td><td>{item.villeDepart} → {item.villeArrivee}</td><td>{item.statutVoyage}</td><td>{number.format(item.capaciteBus || 0)}</td><td>{number.format(item.nbBilletsEnregistres || 0)}</td><td><div className="dashboard-fill-meter"><i style={{ width: `${Math.min(100, Math.max(0, Number(item.tauxBilletsEnregistresPct) || 0))}%` }} /><strong>{percent.format(item.tauxBilletsEnregistresPct || 0)} %</strong></div></td></tr>)}</tbody></table></div> : <div className="dashboard-empty">Aucun voyage n’est disponible dans la vue.</div>}</section>

      <section className="dashboard-analytics-card dashboard-documents-card"><div className="dashboard-analytics-heading"><div><span className="dashboard-eyebrow">FLOTTE · ÉCHÉANCES</span><h2>Documents bus à renouveler</h2></div><Link to="/app/maintenance">Ouvrir maintenance <ArrowRight size={14} /></Link></div>{documentAlerts.length ? <div className="dashboard-alert-list">{documentAlerts.slice(0, 8).map((item) => <article key={item.idDocument}><span className={`document-status ${item.etatEcheance === 'EXPIRE' || !item.estValide ? 'is-expired' : 'is-soon'}`}>{item.etatEcheance === 'EXPIRE' || !item.estValide ? 'Expiré' : `${item.joursAvantExpiration} j`}</span><div><strong>{item.immatriculation} · {item.libelleType}</strong><small>{item.marque} {item.modele || ''} · échéance {day(item.dateExpiration)}</small></div></article>)}</div> : <div className="dashboard-empty">Aucun document expiré ou à échéance dans les 30 jours.</div>}</section>
    </>}

    <section className="dashboard-modules"><div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">OUTILS MÉTIER</span><h2>Vos modules</h2></div></div><div className="dashboard-module-grid">{modules.map(({ title, description, to, icon: Icon }) => <Link className="dashboard-module-card" to={to} key={to}><span className="dashboard-module-icon"><Icon size={18} /></span><h3>{title}</h3><p>{description}</p><ArrowRight size={15} className="dashboard-module-arrow" /></Link>)}</div></section>
    <section className="dashboard-departures"><div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">PLANNING</span><h2>Prochains voyages</h2></div><Link to="/app/billetterie">Ouvrir la billetterie <ArrowRight size={14} /></Link></div>{trips.length ? <div className="dashboard-trip-list">{trips.slice(0, 6).map((trip) => <article key={trip.idVoyage}><div><strong>{trip.villeDepart} → {trip.villeArrivee}</strong><small>{trip.codeVoyage} · {trip.busImmatriculation || 'Bus non renseigné'}</small></div><span>{departureDate(trip.dateHeureDepartPrevue)}</span><b>{trip.statutVoyage || 'Statut non renseigné'}</b></article>)}</div> : <div className="dashboard-empty">Aucun voyage n’est disponible.</div>}</section>
  </main>
}
