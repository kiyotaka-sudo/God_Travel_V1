import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Armchair, BusFront, Check, Clock3, CreditCard, LoaderCircle, LockKeyhole, MapPin, Smartphone, Ticket, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { billetterieApi, paymentApi } from '@api/index'
import { useAuthStore } from '@store/authStore'
import { isSeatSelectable, isValidCmMobile, normalizeCmPhone, parseCmInstant } from '@utils/domain'
import PaymentOperatorChoice from '@components/PaymentOperatorChoice'

const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const asData = (response) => response?.data?.data
const formatDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(parseCmInstant(value))) : '—'

function SeatMap({ plan, selected, onSelect }) {
  const mapRef = useRef(null)
  const total = Math.max(0, Number(plan?.totalPlaces || 0))
  const free = useMemo(() => new Set((plan?.placesLibres || []).map(Number)), [plan])
  const occupied = useMemo(() => new Set((plan?.placesOccupees || []).map(Number)), [plan])
  const rows = Math.ceil(total / 4)
  const height = Math.max(250, rows * 54 + 95)
  const seats = Array.from({ length: total }, (_, index) => {
    const number = index + 1; const col = index % 4; const row = Math.floor(index / 4)
    const x = [52, 94, 204, 246][col]; const y = 78 + row * 54
    const available = isSeatSelectable(number, free, total); const isSelected = selected === number
    const side = col === 0 || col === 3 ? 'fenêtre' : 'allée'
    const rowNumber = row + 1
    return <g key={number} role="button" tabIndex={available ? 0 : -1} aria-disabled={!available} aria-pressed={isSelected} aria-label={`Siège ${number}, rangée ${rowNumber}, ${isSelected ? 'sélectionné' : available ? `libre, côté ${side}` : 'occupé'}`} onClick={() => available && onSelect(number)} onKeyDown={(event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault()
        const direction = event.key === 'ArrowUp' ? -4 : event.key === 'ArrowDown' ? 4 : event.key === 'ArrowLeft' ? -1 : 1
        const candidates = [...mapRef.current.querySelectorAll('[role="button"]')].filter((item) => item.getAttribute('aria-disabled') !== 'true')
        const next = candidates.find((item) => Number(item.getAttribute('aria-label').match(/Siège (\d+)/)?.[1]) === number + direction)
        next?.focus()
      } else if (available && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelect(number) }
    }} className={`seat-svg ${available ? 'is-free' : 'is-occupied'} ${isSelected ? 'is-selected' : ''}`}>
      <title>{`Siège ${number} · rangée ${rowNumber} · ${isSelected ? 'votre sélection' : available ? `libre · côté ${side}` : 'déjà réservé'}`}</title><rect className="seat-hit-target" x={x - 5} y={y - 3} width="44" height="44" rx="9" /><rect className="seat-shape" x={x} y={y} width="34" height="38" rx="7" /><text x={x + 17} y={y + 24} textAnchor="middle">{number}</text>{isSelected && <><circle cx={x + 29} cy={y + 4} r="8" className="seat-check" /><path d={`M${x + 25} ${y + 4}l3 3 5-6`} className="seat-check-mark" /></>}{occupied.has(number) && <path d={`M${x + 7} ${y + 31}l20-20`} className="seat-hatch" />}</g>
  })
  return <div className="seat-map-scroll"><svg ref={mapRef} className="seat-map-svg" viewBox={`0 0 332 ${height}`} role="group" aria-label={`Plan du bus : ${total} sièges`}>
    <rect className="seat-map-body" x="17" y="8" width="298" height={height - 16} rx="42" />
    <path className="seat-map-windshield" d="M66 20 Q166 4 266 20 L280 49 H52Z" />
    <text x="166" y="43" textAnchor="middle" className="seat-map-driver-label">AVANT DU BUS</text>
    <circle className="seat-map-wheel" cx="51" cy="59" r="9" /><circle className="seat-map-wheel" cx="281" cy="59" r="9" />
    <rect className="seat-map-aisle" x="155" y="69" width="22" height={height - 105} rx="10" />
    {seats}
    <text x="166" y={height - 28} textAnchor="middle" className="seat-map-door-label">PORTE · BAGAGES EN SOUTE</text>
  </svg></div>
}

export default function CustomerBookingPage() {
  const [params] = useSearchParams()
  const tripParam = params.get('trip')
  const [trips, setTrips] = useState([])
  const [trip, setTrip] = useState(null)
  const [seatPlan, setSeatPlan] = useState(null)
  const [seat, setSeat] = useState(null)
  const [step, setStep] = useState(0)
  const [operator, setOperator] = useState('MTN')
  const [paymentPhone, setPaymentPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const user = useAuthStore((state) => state.user)
  const name = user?.nomComplet || [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Voyageur'
  const [firstWord = '', ...rest] = name.split(' ')
  const prenom = user?.prenom || firstWord
  const nom = user?.nom || rest.join(' ')
  const phone = user?.telephone || ''
  const price = Number(trip?.tarifBaseXaf || 0)
  const available = useMemo(() => new Set((seatPlan?.placesLibres || []).map(Number)), [seatPlan])
  const paymentStarted = useRef(false)

  useEffect(() => { setPaymentPhone((current) => current || phone) }, [phone])

  useEffect(() => {
    let active = true
    billetterieApi.getVoyages().then((response) => { if (!active) return; const now = Date.now(); const list = (asData(response) || []).filter((item) => parseCmInstant(item.dateHeureDepartPrevue) >= now && Number(item.placesRestantes ?? 1) > 0 && ['PROGRAMME', 'OUVERT', 'CONFIRME'].includes(String(item.statutVoyage || '').toUpperCase())); setTrips(list); const chosen = list.find((item) => item.idVoyage === tripParam); if (chosen) { setTrip(chosen); setStep(1) } })
      .catch((requestError) => { if (active) setError(requestError.response?.data?.message || 'Impossible de charger les départs.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [tripParam])

  const refreshSeats = useCallback(async () => {
    if (!trip?.idVoyage) return
    try {
      const next = asData(await billetterieApi.getSiegesLibres(trip.idVoyage))
      setSeatPlan(next)
      if (seat && !(next?.placesLibres || []).map(Number).includes(Number(seat))) { setSeat(null); toast.error('Ce siège vient d’être réservé. Choisissez-en un autre.') }
    } catch (requestError) { setError(requestError.response?.data?.message || 'Le plan des sièges est indisponible.') }
  }, [trip?.idVoyage, seat])

  useEffect(() => {
    if (!trip) { setSeatPlan(null); setSeat(null); return undefined }
    refreshSeats()
    const timer = window.setInterval(refreshSeats, 15_000)
    const onFocus = () => refreshSeats()
    window.addEventListener('focus', onFocus)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', onFocus) }
  }, [trip, refreshSeats])

  const continueTo = (nextStep) => { setError(''); setStep(nextStep); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const pay = async (event) => {
    event.preventDefault()
    if (paymentStarted.current) return
    if (!trip || !seat || !phone || !price) { toast.error('Vérifiez le départ, le siège et le tarif affiché.'); return }
    if (!isValidCmMobile(paymentPhone)) { toast.error('Saisissez un numéro mobile camerounais à 9 chiffres, commençant par 6.'); return }
    if (!available.has(Number(seat))) { setSeat(null); await refreshSeats(); toast.error('Ce siège n’est plus disponible.'); return }
    paymentStarted.current = true
    setBusy(true); setError('')
    try {
      const created = asData(await billetterieApi.reserverEnLigne({ idVoyage: trip.idVoyage, nomClient: nom, prenomClient: prenom, telephoneClient: phone, numSiege: seat, idCategorie: 'CAT-ADULTE', idModePaiement: 'MONETBIL', montantPaye: price }))
      const payment = asData(await paymentApi.initierMonetbil({ idItem: created.idBillet, typeItem: 'BILLET', montant: price, telephone: normalizeCmPhone(paymentPhone), nomClient: name, emailClient: user?.email, operateur: operator }))
      if (!payment?.success || !payment.paymentUrl) throw new Error(payment?.message || 'Monetbil ne peut pas démarrer le paiement.')
      sessionStorage.setItem('god-travel-payment-reference', payment.referenceTransaction)
      window.location.assign(payment.paymentUrl)
    } catch (requestError) { paymentStarted.current = false; const message = requestError.response?.data?.message || requestError.message || 'La réservation n’a pas abouti.'; setError(message); toast.error(message); if (message.toLowerCase().includes('siège')) { setSeat(null); refreshSeats() } }
    finally { setBusy(false) }
  }

  const stepNames = ['Départ', 'Siège', 'Passager', 'Paiement', 'Billet']
  return <main className="customer-booking-page"><header className="ticket-public-nav"><Link to="/" className="landing-wordmark"><img src="/god-travel-logo.jpg" alt="" /><span>God-<span>travel</span></span></Link><Link to="/mon-espace" className="ticket-back-link"><ArrowLeft size={15} /> Mon espace</Link></header>
    <section className="customer-booking-heading"><div className="ticket-kicker"><span /> RÉSERVATION EN LIGNE</div><h1>Réservez votre départ.</h1><p>Le compte est réservé à son titulaire. Tarif, horaire et disponibilité viennent du système de billetterie.</p></section>
    <nav className="booking-steps" aria-label="Étapes de réservation">{stepNames.map((label, index) => <div key={label} className={`booking-step ${step === index ? 'is-current' : step > index ? 'is-complete' : ''}`} aria-current={step === index ? 'step' : undefined}><span>{step > index ? <Check size={14} /> : index + 1}</span><b>{label}</b></div>)}</nav>
    {error && <div className="customer-booking-error" role="alert">{error}</div>}
    <div className="customer-booking-grid"><section className="customer-trip-panel">
      {step === 0 && <><div className="client-section-title"><div><span className="ticket-kicker">TRAJET</span><h2>Départs disponibles</h2></div><span>{trips.length} affiché(s)</span></div>{loading ? <div className="client-empty"><LoaderCircle className="spin" /> Chargement…</div> : trips.length ? <div className="customer-trip-list">{trips.map((item) => <button type="button" key={item.idVoyage} className={`customer-trip-card ${trip?.idVoyage === item.idVoyage ? 'active' : ''}`} onClick={() => { setTrip(item); setSeat(null); setSeatPlan(null) }}><div><span>{formatDate(item.dateHeureDepartPrevue)}</span><strong>{item.villeDepart} <ArrowRight size={15} /> {item.villeArrivee}</strong><small><BusFront size={13} /> {item.busImmatriculation || 'Bus non renseigné'} · {item.classeBus || 'Classe non renseignée'}</small></div><b>{money.format(item.tarifBaseXaf || 0)}<small> XAF</small></b></button>)}</div> : <div className="client-empty"><BusFront /><strong>Aucun départ publié</strong><span>Réessayez plus tard ou contactez l’agence.</span></div>}<button className="button-primary booking-continue" type="button" disabled={!trip} onClick={() => continueTo(1)}>Choisir un siège <ArrowRight size={16} /></button></>}

      {step === 1 && <><div className="client-section-title"><div><span className="ticket-kicker">CHOIX DU SIÈGE</span><h2>Plan du bus</h2></div><span>{seatPlan?.totalPlaces ?? '—'} places</span></div><div className="customer-selected-trip"><MapPin size={15} /> {trip?.villeDepart} → {trip?.villeArrivee}<span>{formatDate(trip?.dateHeureDepartPrevue)}</span></div>{!seatPlan ? <div className="seat-loading"><LoaderCircle className="spin" size={16} /> Chargement du plan…</div> : <><p className="seat-map-note">Plan indicatif 2 + 2. La disponibilité est actualisée toutes les 15 secondes et vérifiée à nouveau par le serveur.</p><SeatMap plan={seatPlan} selected={seat} onSelect={(value) => setSeat((current) => current === value ? null : value)} /><div className="seat-legend"><span><i className="legend-free" /> Libre</span><span><i className="legend-selected"><Check size={10} /></i> Votre choix</span><span><i className="legend-occupied" /> Occupé</span></div></> }<div className="booking-actions"><button type="button" className="button-secondary" onClick={() => continueTo(0)}><ArrowLeft size={15} /> Retour</button><button type="button" className="button-primary" disabled={!seat} onClick={() => continueTo(2)}>Continuer <ArrowRight size={15} /></button></div></>}

      {step === 2 && <><div className="client-section-title"><div><span className="ticket-kicker">PASSAGER</span><h2>Vos coordonnées</h2></div><UserRound size={18} /></div><div className="customer-selected-trip"><MapPin size={15} /> {trip?.villeDepart} → {trip?.villeArrivee}<span>Siège {seat}</span></div><div className="passenger-summary"><span>Nom du compte</span><strong>{name}</strong><span>Téléphone du compte</span><strong>{phone || 'Non renseigné'}</strong><span>Pièce d’identité</span><strong>Non enregistrée dans votre compte</strong></div><p className="privacy-note">Le billet est établi avec les coordonnées du compte connecté. La réservation pour un tiers n’est pas disponible dans l’API actuelle. <Link to="/confidentialite">Confidentialité</Link></p><div className="booking-actions"><button type="button" className="button-secondary" onClick={() => continueTo(1)}><ArrowLeft size={15} /> Retour</button><button type="button" className="button-primary" onClick={() => continueTo(3)}>Continuer vers le paiement <ArrowRight size={15} /></button></div></>}

      {step === 3 && <><div className="client-section-title"><div><span className="ticket-kicker">PAIEMENT MOBILE</span><h2>Réglez votre billet</h2></div><LockKeyhole size={18} /></div><div className="customer-selected-trip"><MapPin size={15} /> {trip?.villeDepart} → {trip?.villeArrivee}<span>Siège {seat}</span></div><form className="customer-pay-form" onSubmit={pay}><div className="passenger-summary"><span>Passager</span><strong>{name}</strong><span>Départ</span><strong>{formatDate(trip?.dateHeureDepartPrevue)}</strong><span>Téléphone du compte</span><strong>{phone || 'Non renseigné'}</strong><span>Total à payer</span><strong>{money.format(price)} XAF</strong></div><PaymentOperatorChoice value={operator} onChange={setOperator} /><label className="payment-phone-field" htmlFor="payment-phone">Téléphone qui recevra la demande<input id="payment-phone" type="tel" inputMode="tel" autoComplete="tel" value={paymentPhone} onChange={(event) => setPaymentPhone(event.target.value)} placeholder="+237 6 99 00 00 00" aria-describedby="payment-phone-hint" required /><small id="payment-phone-hint">9 chiffres commençant par 6. Le numéro du compte reste celui du passager.</small></label><p className="payment-info"><Smartphone size={15} /> Vous serez redirigé vers Monetbil. Le billet est confirmé uniquement après la notification de paiement.</p><button className="client-auth-submit" type="submit" disabled={!seat || !price || !phone || !isValidCmMobile(paymentPhone) || busy}><CreditCard size={17} />{busy ? 'Préparation du paiement…' : 'Continuer vers Monetbil'}<strong>{money.format(price)} XAF</strong></button></form><div className="booking-actions"><button type="button" className="button-secondary" onClick={() => continueTo(2)}><ArrowLeft size={15} /> Retour</button><span className="booking-no-hold"><Clock3 size={13} /> Aucun maintien temporaire du siège n’est proposé par le serveur.</span></div></>}
    </section><aside className="booking-summary-panel"><div className="section-kicker">RÉCAPITULATIF</div><h2>Votre trajet</h2>{trip ? <><div className="booking-summary-route"><strong>{trip.villeDepart}</strong><ArrowRight size={16} /><strong>{trip.villeArrivee}</strong></div><p>{formatDate(trip.dateHeureDepartPrevue)}</p><div className="booking-summary-item"><span>Bus</span><strong>{trip.busImmatriculation || '—'}</strong></div><div className="booking-summary-item"><span>Siège</span><strong>{seat || 'À choisir'}</strong></div><div className="booking-summary-item"><span>Passager</span><strong>{name}</strong></div><div className="booking-summary-total"><span>Tarif du départ · Adulte</span><strong>{money.format(price)} XAF</strong></div></> : <div className="booking-summary-empty"><Armchair size={20} /><span>Choisissez un départ pour afficher le récapitulatif.</span></div>}<p className="booking-summary-foot"><Ticket size={14} /> Après confirmation, retrouvez votre billet dans Mes billets ou par son code.</p></aside></div>
  </main>
}
