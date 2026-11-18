import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Armchair, BusFront, CircleHelp, Clock3, PackageCheck, ShieldCheck, Ticket, LoaderCircle } from 'lucide-react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { billetterieApi } from '@api/index'
import ScrollJourney from '@components/bus/ScrollJourney'
import ThemeToggle from '@components/ThemeToggle'
import { useAuthStore } from '@store/authStore'
import { occupancyPercent, parseCmInstant } from '@utils/domain'

const routeN3 = [[3.848, 11.502], [3.78, 11.38], [3.75, 11.15], [3.85, 11.02], [3.8, 10.13], [3.98, 9.92], [4.051, 9.768]]
const places = [{ point: routeN3[0], name: 'Yaoundé · Mvan' }, { point: routeN3[3], name: 'Boumnyébel' }, { point: routeN3[4], name: 'Édéa' }, { point: routeN3[6], name: 'Douala · Bépanda' }]
const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const dateTime = (value) => value ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(parseCmInstant(value))) : 'Horaire non disponible'
const money = (value) => value != null ? `${number.format(value).replaceAll('\u202f', ' ')} XAF` : 'Tarif communiqué par l’agence'
const dataOf = (response) => response?.data?.data || []

export default function LandingPage() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [loadingTrips, setLoadingTrips] = useState(true)
  const [tripError, setTripError] = useState('')
  const [selectedTrip, setSelectedTrip] = useState('')

  useEffect(() => {
    let active = true
    billetterieApi.getVoyages().then((response) => { if (active) setTrips(dataOf(response)) })
      .catch((error) => { if (active) setTripError(error.response?.data?.message || 'Les départs ne peuvent pas être chargés pour le moment.') })
      .finally(() => { if (active) setLoadingTrips(false) })
    return () => { active = false }
  }, [])

  const departures = useMemo(() => trips.filter((trip) => {
    const status = String(trip.statutVoyage || '').toUpperCase()
    const departure = parseCmInstant(trip.dateHeureDepartPrevue)
    return ['PROGRAMME', 'EN_COURS', 'OUVERT', 'CONFIRME'].includes(status) && departure >= Date.now() && Number(trip.placesRestantes ?? 1) > 0
  }).sort((left, right) => parseCmInstant(left.dateHeureDepartPrevue) - parseCmInstant(right.dateHeureDepartPrevue)), [trips])
  const handleBooking = (event) => {
    event.preventDefault()
    const trip = departures.find((candidate) => candidate.idVoyage === selectedTrip)
    if (!trip) return
    navigate(`/reserver?trip=${encodeURIComponent(trip.idVoyage)}`)
  }

  return <main className="landing-page">
    <header className="landing-nav"><Link to="/" className="landing-wordmark"><img src="/god-travel-logo.jpg" alt="" /><span>God-<span>travel</span></span></Link><nav className="landing-links" aria-label="Navigation principale"><a href="#departures">Départs</a><a href="#route">Itinéraire</a><a href="#services">Services</a></nav><div className="landing-account-links"><ThemeToggle compact />{user?.role === 'ROLE_CLIENT' ? <Link className="nav-signin" to="/mon-espace">Mon espace</Link> : <Link className="nav-signin" to="/connexion">Se connecter</Link>}<Link className="nav-booking" to="/reserver">Réserver <ArrowRight size={15} /></Link><Link className="landing-staff-link" to={token ? '/app' : '/login'}>{token && user?.role !== 'ROLE_CLIENT' ? 'Espace équipe' : 'Accès équipe'}</Link></div></header>

    <ScrollJourney />

    <section className="editorial-intro"><div className="section-kicker">LE VOYAGE, EN TOUTE CLARTÉ</div><h2>Voyagez. Explorez.<br /><em>Arrivez.</em></h2><p>Un trajet interurbain se prépare avec des horaires lisibles, un siège choisi et un billet que vous pouvez retrouver avant le départ.</p></section>

    <section className="booking-section" id="reserver"><div className="booking-intro"><div className="section-kicker">RÉSERVATION EN LIGNE</div><h2>Votre prochain départ,<br /><em>en quelques étapes.</em></h2><p>Choisissez un départ réellement publié. Un compte voyageur est requis pour réserver et payer en ligne.</p><Link to="/inscription" className="story-inline-link">Créer un compte voyageur <ArrowRight size={15} /></Link></div><form className="landing-search" onSubmit={handleBooking}><label>Départ<select value={selectedTrip} required onChange={(event) => setSelectedTrip(event.target.value)}><option value="">Choisir un départ disponible</option>{departures.map((trip) => <option key={trip.idVoyage} value={trip.idVoyage}>{trip.villeDepart} → {trip.villeArrivee} · {dateTime(trip.dateHeureDepartPrevue)}</option>)}</select></label><label>Arrivée<span className="search-readonly">{departures.find((trip) => trip.idVoyage === selectedTrip)?.villeArrivee || 'Selon le départ choisi'}</span></label><label>Date et heure<span className="search-readonly">{dateTime(departures.find((trip) => trip.idVoyage === selectedTrip)?.dateHeureDepartPrevue)}</span></label><div className="landing-search-price"><span>Tarif du départ</span><strong>{money(departures.find((trip) => trip.idVoyage === selectedTrip)?.tarifBaseXaf)}</strong></div><button className="button-primary" disabled={loadingTrips || departures.length === 0 || !selectedTrip}>{loadingTrips ? <LoaderCircle className="spin" size={16} /> : 'Continuer'} <ArrowRight size={16} /></button>{tripError && <p className="inline-error" role="alert">{tripError}</p>}{!loadingTrips && !tripError && departures.length === 0 && <p className="inline-empty">Aucun départ n’est disponible actuellement. Consultez l’agence pour connaître les prochains horaires.</p>}</form></section>

    <section className="departures-section" id="departures"><div className="section-heading-row"><div><div className="section-kicker">HORAIRES PUBLIÉS</div><h2>Prochains départs</h2><p>Les départs ci-dessous sont chargés depuis le système de billetterie.</p></div><Link className="text-action" to="/reserver">Tous les départs <ArrowRight size={15} /></Link></div>{loadingTrips ? <div className="landing-loading"><LoaderCircle className="spin" /> Chargement des départs…</div> : tripError ? <div className="landing-error" role="alert">{tripError} Réessayez dans un instant.</div> : departures.length === 0 ? <div className="landing-empty"><BusFront size={21} /><strong>Pas de départ affiché pour le moment</strong><span>Les horaires apparaîtront ici dès leur publication par l’agence.</span></div> : <div className="departure-teasers">{departures.slice(0, 4).map((trip) => <article className="departure-teaser" key={trip.idVoyage}><span className="departure-teaser-time"><Clock3 size={14} /> {dateTime(trip.dateHeureDepartPrevue)}</span><div className="departure-teaser-route"><strong>{trip.villeDepart}</strong><span>→</span><strong>{trip.villeArrivee}</strong><small>{trip.busImmatriculation || 'Bus non renseigné'} · {trip.classeBus || 'Classe non renseignée'}</small></div><div className="departure-teaser-capacity"><span>{trip.placesRestantes ?? '—'} place(s) restante(s)</span><div><i style={{ width: `${occupancyPercent(trip.placesOccupees, trip.capaciteTotale)}%` }} /></div></div><strong className="departure-teaser-price">{money(trip.tarifBaseXaf)}</strong><button className="icon-link-button" onClick={() => navigate(`/reserver?trip=${encodeURIComponent(trip.idVoyage)}`)} aria-label={`Choisir le départ ${trip.villeDepart} vers ${trip.villeArrivee}`}><ArrowRight size={17} /></button></article>)}</div>}</section>

    <section className="service-strip" id="services"><div className="section-kicker">LES SERVICES</div><h2>Le trajet et <em>ce qui l’accompagne.</em></h2><div className="service-grid"><article><Armchair /><span>01</span><h3>Votre siège</h3><p>La disponibilité du siège est vérifiée depuis le plan du départ sélectionné.</p></article><article><Ticket /><span>02</span><h3>Votre billet</h3><p>Après paiement confirmé, retrouvez le billet nominatif et son QR signé par le serveur.</p></article><article><PackageCheck /><span>03</span><h3>Fret et colis</h3><p>Le suivi par code est disponible. Le tarif d’expédition est confirmé par l’agence.</p></article><article><ShieldCheck /><span>04</span><h3>Paiement mobile</h3><p>Le statut du paiement est confirmé par la notification de l’opérateur.</p></article></div><div className="service-note"><CircleHelp size={15} /> Les packs, la fidélité, le devis de fret et le fonctionnement hors ligne ne sont pas disponibles dans l’API actuelle.</div></section>

    <section className="route-section" id="route"><div className="route-intro"><div className="section-kicker">L’ITINÉRAIRE</div><h2>La Nationale 3,<br /><em>entre deux villes.</em></h2><p>Repères indicatifs sur l’axe Yaoundé–Douala. Cette carte présente le parcours géographique, pas la position en direct d’un véhicule.</p><div className="route-stops">{places.map((place) => <span key={place.name}><i /> {place.name}</span>)}</div></div><div className="landing-map-wrap"><MapContainer className="landing-map" center={[3.9, 10.65]} zoom={7} scrollWheelZoom={false} attributionControl><TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><Polyline positions={routeN3} pathOptions={{ color: '#14b2b6', weight: 4, opacity: .85 }} />{places.map((place) => <CircleMarker key={place.name} center={place.point} radius={6} pathOptions={{ color: '#0b1417', weight: 2, fillColor: '#14b2b6', fillOpacity: 1 }}><Tooltip>{place.name}</Tooltip></CircleMarker>)}</MapContainer><div className="map-caption"><span className="map-live-dot" /> <span>ITINÉRAIRE INDICATIF</span><span>Yaoundé → Douala</span></div></div></section>

    <section className="final-cta"><div className="section-kicker">PRÊT POUR LE DÉPART ?</div><h2>Choisissez un horaire.<br /><em>Nous vous gardons une place.</em></h2><p>Connectez-vous à votre compte voyageur pour réserver et suivre le statut du paiement.</p><Link className="button-primary" to="/reserver">Consulter les départs <ArrowRight size={16} /></Link></section>
    <footer className="landing-footer"><Link to="/" className="footer-mark">God-travel<span>UNITED EXPRESS · CAMEROUN</span></Link><Link to="/confidentialite">Confidentialité</Link><Link to="/billet">Retrouver un billet</Link><span>Voyagez · Explorez · Arrivez</span></footer>
  </main>
}
