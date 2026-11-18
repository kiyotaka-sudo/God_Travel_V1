import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bus, LoaderCircle, MapPinned, Package, Ticket, Wallet } from 'lucide-react'
import { adminApi, billetterieApi } from '@api/index'
import { useAuthStore } from '@store/authStore'

const dataOf = (response) => response?.data?.data
const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const date = (value) => value ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [stats, setStats] = useState(null)
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    Promise.all([adminApi.getStats(), billetterieApi.getVoyages()]).then(([statsResponse, tripsResponse]) => {
      if (!active) return
      setStats(dataOf(statsResponse)); setTrips(dataOf(tripsResponse) || [])
    }).catch((e) => { if (active) setError(e.response?.data?.message || 'Les indicateurs ne sont pas disponibles. Vérifiez l’accès à l’API et les données.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const values = [
    ['Voyages enregistrés', stats?.totalVoyages, Bus],
    ['Billets vendus', stats?.totalBilletsVendus, Ticket],
    ['Colis traités', stats?.totalColisTraites, Package],
    ['Bus dans la flotte', stats?.totalBusFlotte, MapPinned],
    ['Chiffre billetterie', `${money.format(stats?.chiffreAffairesBilletterie || 0)} XAF`, Ticket],
    ['Chiffre fret', `${money.format(stats?.chiffreAffairesFret || 0)} XAF`, Wallet],
  ]
  const modules = [
    { title: 'Guichet & billetterie', description: 'Ventes enregistrées sur les départs existants.', to: '/app/billetterie', icon: Ticket },
    { title: 'Fret & colis', description: 'Registre, suivi et remise des colis.', to: '/app/colis', icon: Package },
    { title: 'Caisse & clôtures', description: 'Sessions, transactions et relevés disponibles.', to: '/app/caisse', icon: Wallet },
    { title: 'Flotte GPS', description: 'Positions reçues par le système.', to: '/app/gps', icon: MapPinned },
    { title: 'Maintenance', description: 'Interventions de maintenance transmises à l’API.', to: '/app/maintenance', icon: Bus },
  ]
  return <main className="dashboard-home"><header className="dashboard-welcome"><div><span className="dashboard-eyebrow">TABLEAU DE BORD · ADMINISTRATION</span><h1>Bonjour{user?.nomComplet ? `, ${user.nomComplet.split(' ')[0]}` : ''}.</h1><p>Les indicateurs ci-dessous reflètent les enregistrements accessibles par l’API.</p></div><Link className="dashboard-user-chip" to="/app/admin"><span>ADMINISTRATION</span><small>Utilisateurs, rôles et référentiels</small></Link></header>
    {loading ? <div className="dashboard-loading"><LoaderCircle className="spin" /> Chargement des indicateurs…</div> : error ? <div className="dashboard-data-error" role="alert">{error}</div> : <section className="dashboard-stats"><div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">DONNÉES DU SYSTÈME</span><h2>Activité globale</h2></div><span>Chiffres cumulés retournés par l’API</span></div><div className="dashboard-stat-grid">{values.map(([label, value, Icon]) => <article key={label}><Icon size={17} /><small>{label}</small><strong>{value ?? '—'}</strong></article>)}</div><div className="dashboard-data-note">Le backend ne fournit pas encore de ventilation journalière, d’occupation calculée, ni de rapprochement Monetbil sur cet écran.</div></section>}
    <section className="dashboard-modules"><div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">OUTILS MÉTIER</span><h2>Vos modules</h2></div></div><div className="dashboard-module-grid">{modules.map(({ title, description, to, icon: Icon }) => <Link className="dashboard-module-card" to={to} key={to}><span className="dashboard-module-icon"><Icon size={18} /></span><h3>{title}</h3><p>{description}</p><ArrowRight size={15} className="dashboard-module-arrow" /></Link>)}</div></section>
    <section className="dashboard-departures"><div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">PLANNING</span><h2>Voyages enregistrés</h2></div><Link to="/app/billetterie">Ouvrir la billetterie <ArrowRight size={14} /></Link></div>{trips.length ? <div className="dashboard-trip-list">{trips.slice(0, 6).map((trip) => <article key={trip.idVoyage}><div><strong>{trip.villeDepart} → {trip.villeArrivee}</strong><small>{trip.codeVoyage} · {trip.busImmatriculation || 'Bus non renseigné'}</small></div><span>{date(trip.dateHeureDepartPrevue)}</span><b>{trip.statutVoyage || 'Statut non renseigné'}</b></article>)}</div> : <div className="dashboard-data-error">Aucun voyage n’est disponible.</div>}</section>
  </main>
}
