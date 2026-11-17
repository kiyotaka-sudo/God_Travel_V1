import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BusFront, CreditCard, LoaderCircle, MapPin, Smartphone, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'
import { billetterieApi, paymentApi } from '@api/index'
import { useAuthStore } from '@store/authStore'

const money = new Intl.NumberFormat('fr-FR')
function asData(response) { return response?.data?.data }
function formatTime(value) { return value ? new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '—' }

export default function CustomerBookingPage() {
  const [trips, setTrips] = useState([]); const [trip, setTrip] = useState(null)
  const [seatPlan, setSeatPlan] = useState(null); const [seat, setSeat] = useState(null)
  const [operator, setOperator] = useState('CM_MTNMOBILEMONEY'); const [cni, setCni] = useState('')
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(false); const [error, setError] = useState('')
  const user = useAuthStore((s) => s.user); const navigate = useNavigate()
  const name = user?.nomComplet || 'Voyageur'; const [prenom = '', ...rest] = name.split(' '); const nom = rest.join(' ') || prenom
  const phone = user?.telephone || ''
  const price = Number(trip?.tarifBaseXaf || 0)
  const free = useMemo(() => new Set(seatPlan?.placesLibres || []), [seatPlan])

  useEffect(() => { billetterieApi.getVoyages().then((r) => setTrips(asData(r) || []))
    .catch((e) => setError(e.response?.data?.message || 'Impossible de charger les départs.'))
    .finally(() => setLoading(false)) }, [])
  useEffect(() => { if (!trip) { setSeatPlan(null); setSeat(null); return }
    let active = true; setSeatPlan(null); setSeat(null)
    billetterieApi.getSiegesLibres(trip.idVoyage).then((r) => { if (active) setSeatPlan(asData(r)) })
      .catch((e) => { if (active) setError(e.response?.data?.message || 'Le plan des sièges est indisponible.') })
    return () => { active = false }
  }, [trip])

  const pay = async (event) => {
    event.preventDefault()
    if (!trip || !seat || !phone || !price) { toast.error('Vérifiez le départ, le siège et le tarif.'); return }
    setBusy(true); setError('')
    try {
      const created = asData(await billetterieApi.reserverEnLigne({ idVoyage: trip.idVoyage,
        nomClient: nom, prenomClient: prenom, telephoneClient: phone, cniClient: cni || null,
        numSiege: seat, idCategorie: 'CAT-ADULTE', idModePaiement: 'MONETBIL', montantPaye: price }))
      const payment = asData(await paymentApi.initierMonetbil({ idItem: created.idBillet, typeItem: 'BILLET', montant: price,
        telephone: phone, nomClient: name, emailClient: user?.email, operateur }))
      if (!payment?.success || !payment.paymentUrl) throw new Error(payment?.message || 'Monetbil ne peut pas démarrer le paiement.')
      window.location.assign(payment.paymentUrl)
    } catch (e) { const message = e.response?.data?.message || e.message || 'La réservation n’a pas abouti.'; setError(message); toast.error(message) }
    finally { setBusy(false) }
  }

  return <main className="customer-booking-page"><header className="ticket-public-nav"><Link to="/" className="landing-wordmark"><img src="/god-travel-logo.jpg" alt="" /><span>GOD<span>TRAVEL</span></span></Link><Link to="/mon-espace" className="ticket-back-link"><ArrowLeft size={15} /> Mon espace</Link></header>
    <section className="customer-booking-heading"><div className="ticket-kicker"><span /> RÉSERVATION EN LIGNE</div><h1>Choisissez votre départ.</h1><p>Choisissez un siège, réglez sur votre téléphone et retrouvez le billet dans votre espace.</p></section>
    {error && <div className="customer-booking-error">{error}</div>}
    <div className="customer-booking-grid"><section className="customer-trip-panel"><div className="client-section-title"><div><span className="ticket-kicker">YAOUNDÉ — DOUALA</span><h2>Prochains départs</h2></div><span>{trips.length} départs</span></div>
      {loading ? <div className="client-empty"><LoaderCircle className="spin" /> Chargement…</div> : trips.length ? <div className="customer-trip-list">{trips.map((item) => <button type="button" key={item.idVoyage} className={`customer-trip-card ${trip?.idVoyage === item.idVoyage ? 'active' : ''}`} onClick={() => setTrip(item)}><div><span>{formatTime(item.dateHeureDepartPrevue)}</span><strong>{item.villeDepart} <ArrowRight size={15} /> {item.villeArrivee}</strong><small><BusFront size={13} /> {item.busImmatriculation || 'Bus affecté'}</small></div><b>{money.format(item.tarifBaseXaf || 0)} <small>FCFA</small></b></button>)}</div> : <div className="client-empty">Aucun départ disponible.</div>}
    </section><section className="customer-booking-form-panel"><div className="client-section-title"><div><span className="ticket-kicker">VOTRE PLACE</span><h2>{trip ? 'Choisir un siège' : 'Sélectionnez un départ'}</h2></div><Ticket size={18} /></div>
      {trip && <><div className="customer-selected-trip"><MapPin size={15} /> {trip.villeDepart} → {trip.villeArrivee}<span>{formatTime(trip.dateHeureDepartPrevue)}</span></div>
        {!seatPlan ? <div className="seat-loading"><LoaderCircle className="spin" size={16} /> Chargement des sièges…</div> : <div className="seat-grid customer-seat-grid">{Array.from({ length: seatPlan.totalPlaces || 0 }, (_, i) => i + 1).map((n) => <button key={n} type="button" disabled={!free.has(n)} className={`seat-button ${free.has(n) ? 'is-free' : 'is-occupied'} ${seat === n ? 'is-current' : ''}`} onClick={() => setSeat(n)}>{n}</button>)}</div>}
        <form className="customer-pay-form" onSubmit={pay}><div className="customer-summary"><span>Passager</span><strong>{name}</strong><span>Téléphone de paiement</span><strong>{phone || 'Non renseigné'}</strong><label>Numéro CNI <small>facultatif</small><input value={cni} onChange={(e) => setCni(e.target.value)} /></label></div><label className="operator-field">Opérateur<select value={operator} onChange={(e) => setOperator(e.target.value)}><option value="CM_MTNMOBILEMONEY">MTN Mobile Money</option><option value="CM_ORANGEMONEY">Orange Money</option></select></label><button className="client-auth-submit" type="submit" disabled={!seat || !price || busy}><Smartphone size={17} />{busy ? 'Préparation du paiement…' : 'Payer avec Monetbil'}<strong>{money.format(price)} FCFA</strong><CreditCard size={16} /></button></form>
      </>}
    </section></div>
  </main>
}
