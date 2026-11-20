import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BusFront, Gift, LoaderCircle, LogOut, Package, Printer, Ticket } from 'lucide-react'
import { billetterieApi, fideliteApi, packApi } from '@api/index'
import { useAuthStore } from '@store/authStore'
import { parseCmInstant } from '@utils/domain'

const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const departureDate = (value, style = 'medium') => new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', dateStyle: style, timeStyle: 'short' }).format(new Date(parseCmInstant(value)))
function asData(response) { return response?.data?.data }

export default function ClientAccountPage() {
  const [tickets, setTickets] = useState([])
  const [fidelity, setFidelity] = useState(null)
  const [packs, setPacks] = useState([])
  const [loyaltyError, setLoyaltyError] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  useEffect(() => {
    billetterieApi.mesBillets().then((response) => setTickets(asData(response) || []))
      .catch((e) => setError(e.response?.data?.message || 'Vos billets ne sont pas disponibles.'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(() => {
    Promise.allSettled([fideliteApi.monCompteur(), packApi.mesPacks()]).then(([counter, subscriptions]) => {
      if (counter.status === 'fulfilled') setFidelity(asData(counter.value))
      else setLoyaltyError('Votre compteur de fidélité est momentanément indisponible.')
      if (subscriptions.status === 'fulfilled') setPacks(asData(subscriptions.value) || [])
      else setLoyaltyError((current) => [current, 'Vos packs ne peuvent pas être chargés.'].filter(Boolean).join(' '))
    })
  }, [])

  return <main className="client-account-page"><header className="ticket-public-nav"><Link to="/" className="landing-wordmark"><img src="/god-travel-logo.jpg" alt="" /><span>GOD<span>TRAVEL</span></span></Link><button className="client-logout" onClick={() => { logout(); window.location.assign('/') }}><LogOut size={15} /> Déconnexion</button></header>
    <section className="client-account-head"><div><div className="ticket-kicker"><span /> ESPACE VOYAGEUR</div><h1>Bonjour{user?.nomComplet ? `, ${user.nomComplet.split(' ')[0]}` : ''}.</h1><p>Vos réservations et vos billets réunis au même endroit.</p></div><Link to="/reserver" className="client-primary-link"><Ticket size={16} /> Réserver un billet <ArrowRight size={16} /></Link></section>
    <section className="client-benefits-grid" aria-label="Fidélité et packs"><article className="client-benefit-card client-fidelity-card"><div className="client-benefit-heading"><span><Gift size={17} /></span><div><small>VOTRE AVANTAGE</small><h2>Ma fidélité</h2></div></div>{loyaltyError && <p className="client-benefit-error">{loyaltyError}</p>}{fidelity ? <><div className="client-fidelity-count"><strong>{fidelity.billetsCumules}<small> / 10</small></strong><span>voyages validés vers le prochain billet offert</span></div><div className="client-fidelity-meter"><i style={{ width: `${Math.min(100, (Number(fidelity.billetsCumules || 0) / 10) * 100)}%` }} /></div><div className="client-benefit-meta"><span>{fidelity.billetsRestantsAvantGratuit} voyage(s) avant le prochain gratuit</span><b>{fidelity.soldeGratuits} billet(s) gratuit(s) disponible(s)</b></div></> : !loyaltyError && <div className="client-benefit-loading"><LoaderCircle className="spin" size={15} /> Chargement du compteur…</div>}</article>
      <article className="client-benefit-card"><div className="client-benefit-heading"><span><Package size={17} /></span><div><small>VOYAGES PRÉPAYÉS</small><h2>Mes packs</h2></div></div>{packs.length ? <div className="client-pack-list">{packs.map((pack) => <article key={pack.idPackClient}><div><strong>{pack.libellePack}</strong><small>Valide jusqu’au {new Date(`${pack.dateExpiration}T00:00:00`).toLocaleDateString('fr-FR')}</small></div><span className={pack.estExpire || pack.estEpuise ? 'is-exhausted' : ''}>{pack.estExpire ? 'Expiré' : pack.estEpuise ? 'Épuisé' : `${pack.voyagesRestants} / ${pack.voyagesInclus} trajets`}</span></article>)}</div> : <div className="client-pack-empty"><span>Aucun pack souscrit pour le moment.</span><small>Les packs achetés apparaîtront ici avec leur solde et leur échéance.</small></div>}</article></section>
    <section className="client-tickets-section"><div className="client-section-title"><div><span className="ticket-kicker">VOTRE ACTIVITÉ</span><h2>Mes billets</h2></div><span>{tickets.length} billet{tickets.length > 1 ? 's' : ''}</span></div>
      {loading ? <div className="client-empty"><LoaderCircle className="spin" /> Chargement de vos billets…</div> : error ? <div className="client-empty is-error">{error}</div> : tickets.length === 0 ? <div className="client-empty"><BusFront size={25} /><strong>Aucun voyage pour le moment</strong><span>Choisissez votre prochain départ quand vous le souhaitez.</span><Link to="/reserver">Voir les départs <ArrowRight size={15} /></Link></div> : <div className="client-ticket-list">{tickets.map((ticket) => <article className="client-ticket-row" key={ticket.codeBillet}><div className="client-ticket-route"><strong>{ticket.villeDepart}</strong><ArrowRight size={16} /><strong>{ticket.villeArrivee}</strong><span>{departureDate(ticket.departPrevu)}</span></div><div className="client-ticket-meta"><span>Siège <strong>{ticket.numeroSiege}</strong></span><span>Réf. <strong>{ticket.codeBillet}</strong></span><span><strong>{money.format(ticket.montantXaf)} XAF</strong></span></div><button className="client-ticket-view" onClick={() => setSelected(ticket)}>Voir / imprimer <Printer size={15} /></button></article>)}</div>}
    </section>
    {selected && <div className="ticket-modal-backdrop" onClick={() => setSelected(null)}><section className="ticket-modal" onClick={(e) => e.stopPropagation()}><div className="ticket-result-tools"><div className="ticket-confirmed"><Ticket size={17} /><span>Billet confirmé</span></div><button onClick={() => window.print()} className="ticket-print-button"><Printer size={16} /> Imprimer</button><button className="ticket-modal-close" onClick={() => setSelected(null)} aria-label="Fermer">×</button></div><article className="print-ticket" id="billet-print"><div className="print-ticket-top"><div className="print-ticket-brand"><img src="/god-travel-logo.jpg" alt="" /><div><strong>GOD TRAVEL</strong><span>UNITED EXPRESS · CAMEROUN</span></div></div><div className="ticket-status-stamp">VALIDÉ</div></div><div className="print-ticket-route"><div><small>DÉPART</small><strong>{selected.villeDepart}</strong><span>{departureDate(selected.departPrevu, 'long')}</span></div><ArrowRight size={21} /><div><small>ARRIVÉE</small><strong>{selected.villeArrivee}</strong><span>Voyage interurbain</span></div></div><div className="print-ticket-rule" /><div className="print-ticket-details"><div><small>PASSAGER</small><strong>{selected.nomPassager}</strong></div><div><small>SIÈGE</small><strong>{selected.numeroSiege}</strong></div><div><small>BUS</small><strong>{selected.immatriculationBus}</strong></div><div><small>RÉFÉRENCE</small><strong>{selected.codeBillet}</strong></div><div><small>MONTANT PAYÉ</small><strong>{money.format(selected.montantXaf)} XAF</strong></div><div><small>RÉSERVATION</small><strong>{selected.codeReservation}</strong></div></div><div className="print-ticket-bottom"><img src={`data:image/png;base64,${selected.qrCodeBase64}`} alt="QR code du billet" /><div><strong>Présentez ce code à l’embarquement.</strong><span>Conservez votre billet pendant le voyage.</span></div></div></article></section></div>}
  </main>
}
