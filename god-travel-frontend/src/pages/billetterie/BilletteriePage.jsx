import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, BusFront, CheckCircle2, Clock3, LoaderCircle, LockKeyhole, MapPin, PackageCheck, Printer, RefreshCw, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'
import { bagageApi, billetterieApi, caisseApi, paymentApi } from '@api/index'
import { useAuthStore } from '@store/authStore'
import { useSeatLock } from '@hooks/useSeatLock'
import PaymentOperatorChoice from '@components/PaymentOperatorChoice'
import MonetbilWidgetForm from '@components/MonetbilWidgetForm'

const dataOf = (response) => response?.data?.data
const money = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const when = (value) => value ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '—'
const formatCountdown = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

export default function BilletteriePage() {
  const role = useAuthStore((state) => state.user?.role)
  const canUseCash = ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER'].includes(role)
  const [voyages, setVoyages] = useState([])
  const [voyage, setVoyage] = useState(null)
  const [sieges, setSieges] = useState(null)
  const [siege, setSiege] = useState(null)
  const [session, setSession] = useState(null)
  const [passager, setPassager] = useState({ prenom: '', nom: '', telephone: '', cni: '' })
  const [mode, setMode] = useState('ESPECES')
  const [operateur, setOperateur] = useState('MTN')
  const [ticket, setTicket] = useState(null)
  const [ticketId, setTicketId] = useState('')
  const [bagage, setBagage] = useState(null)
  const [bagageForm, setBagageForm] = useState({ poidsKg: '20', description: '' })
  const [bagageSaving, setBagageSaving] = useState(false)
  const [paymentSession, setPaymentSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const activeTripId = useRef(null)
  const price = Number(voyage?.tarifBaseXaf || 0)
  const freeSeats = useMemo(() => new Set((sieges?.placesLibres || []).map(Number)), [sieges])
  const lockedSeats = useMemo(() => new Set([...(sieges?.placesVerrouillees || []), ...(sieges?.placesEnAttentePaiement || [])].map(Number)), [sieges])
  const poidsBagage = Number(bagageForm.poidsKg || 0)
  const fraisBagage = poidsBagage > 20 ? Math.ceil(poidsBagage - 20) * 200 : 0
  const onLockExpired = () => {
    setSiege(null)
    toast.error('Le délai de réservation du siège est écoulé. Choisissez une place à nouveau.')
  }
  const { lock: seatLock, remainingSeconds, select: selectSeatLock, release: releaseSeatLock } = useSeatLock(onLockExpired)

  useEffect(() => { activeTripId.current = voyage?.idVoyage || null }, [voyage?.idVoyage])

  const loadSession = async () => {
    if (!canUseCash) return
    try { setSession(dataOf(await caisseApi.getSessionActive())) } catch (e) { setError(e.response?.data?.message || 'La session de caisse ne peut pas être vérifiée.') }
  }
  useEffect(() => {
    let active = true
    Promise.all([billetterieApi.getVoyages(), canUseCash ? caisseApi.getSessionActive() : Promise.resolve(null)])
      .then(([trips, cash]) => { if (!active) return; const list = dataOf(trips) || []; setVoyages(list); if (cash) setSession(dataOf(cash)) })
      .catch((e) => { if (active) setError(e.response?.data?.message || 'Impossible de charger les départs.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [canUseCash])

  useEffect(() => {
    if (!voyage) { setSieges(null); setSiege(null); return undefined }
    let active = true
    const refresh = () => billetterieApi.getSiegesLibres(voyage.idVoyage).then((r) => { if (active) { const plan = dataOf(r); setSieges(plan); const hasOwnLock = seatLock?.idVoyage === voyage.idVoyage && Number(seatLock?.numSiege) === Number(siege); if (!hasOwnLock) setSiege((current) => current && (plan?.placesLibres || []).map(Number).includes(Number(current)) ? current : null) } }).catch((e) => { if (active) setError(e.response?.data?.message || 'Impossible de lire la disponibilité des sièges.') })
    refresh()
    const timer = window.setInterval(refresh, 15_000)
    const onFocus = () => refresh()
    window.addEventListener('focus', onFocus)
    return () => { active = false; clearInterval(timer); window.removeEventListener('focus', onFocus) }
  }, [voyage, seatLock, siege])

  const selectVoyage = async (selected) => {
    if (selected.idVoyage === voyage?.idVoyage) return
    if (!await releaseSeatLock()) {
      toast.error('La place sélectionnée n’a pas pu être libérée. Réessayez avant de changer de départ.')
      return
    }
    activeTripId.current = selected.idVoyage
    setSiege(null); setSieges(null); setVoyage(selected); setTicket(null); setTicketId(''); setBagage(null); setPaymentSession(null); setError('')
  }
  const handleSeatSelect = async (number) => {
    if (!voyage?.idVoyage) return
    const requestedTrip = voyage.idVoyage
    try {
      const nextLock = await selectSeatLock(requestedTrip, number)
      if (activeTripId.current !== requestedTrip) {
        if (nextLock) await releaseSeatLock(nextLock)
        return
      }
      setSiege(nextLock ? Number(number) : null)
      if (nextLock) {
        const plan = dataOf(await billetterieApi.getSiegesLibres(requestedTrip))
        if (activeTripId.current === requestedTrip) setSieges(plan)
      }
    } catch (e) {
      setSiege(null)
      const message = e.response?.data?.message || 'Impossible de réserver cette place.'
      setError(message); toast.error(message)
      try { const plan = dataOf(await billetterieApi.getSiegesLibres(requestedTrip)); if (activeTripId.current === requestedTrip) setSieges(plan) } catch { /* the next refresh will retry */ }
    }
  }
  const openCashSession = async () => {
    setBusy(true)
    try { await caisseApi.ouvrirSession(); await loadSession(); toast.success('Session de caisse ouverte.') }
    catch (e) { const message = e.response?.data?.message || 'Impossible d’ouvrir la caisse.'; setError(message); toast.error(message) }
    finally { setBusy(false) }
  }
  const sell = async (event) => {
    event.preventDefault(); setError('')
    if (!voyage || !siege || !price) { toast.error('Choisissez un départ et un siège libre.'); return }
    if (!passager.nom.trim() || !passager.telephone.trim()) { toast.error('Le nom et le téléphone du passager sont requis.'); return }
    if (mode === 'ESPECES' && !session?.idCloture) { toast.error('Ouvrez une session de caisse avant la vente.'); return }
    const ownsSelectedSeat = seatLock?.idVoyage === voyage.idVoyage && Number(seatLock?.numSiege) === Number(siege)
    if (!freeSeats.has(Number(siege)) && !ownsSelectedSeat) { setSiege(null); toast.error('Cette place n’est plus libre. Le plan a été actualisé.'); return }
    setTicket(null); setTicketId(''); setBagage(null)
    setBusy(true)
    try {
      const result = dataOf(await billetterieApi.creerBillet({ idVoyage: voyage.idVoyage, nomClient: passager.nom.trim(), prenomClient: passager.prenom.trim(), telephoneClient: passager.telephone.trim(), cniClient: passager.cni.trim() || null, numSiege: siege, idCategorie: 'CAT-ADULTE', idModePaiement: mode === 'ESPECES' ? 'ESPECES' : 'MONETBIL', idClotureCaisse: mode === 'ESPECES' ? session.idCloture : null, montantPaye: price }))
      await releaseSeatLock(seatLock)
      setSiege(null)
      const updatedPlan = dataOf(await billetterieApi.getSiegesLibres(voyage.idVoyage))
      if (activeTripId.current === voyage.idVoyage) setSieges(updatedPlan)
      if (mode === 'MONETBIL') {
        const payment = dataOf(await paymentApi.initierMonetbil({ idItem: result.idBillet, typeItem: 'BILLET', montant: price, telephone: passager.telephone.trim(), nomClient: `${passager.prenom} ${passager.nom}`.trim(), operateur }))
        if (!payment?.success || !payment?.paymentUrl) throw new Error(payment?.message || 'Monetbil n’a pas pu créer la session de paiement.')
        sessionStorage.setItem('god-travel-payment-reference', payment.referenceTransaction)
        setPaymentSession(payment)
        return
      }
      const ticketData = dataOf(await billetterieApi.consulterBillet(result.codeBillet, passager.telephone.trim()))
      setTicket(ticketData); setTicketId(result.idBillet); setBagage(null); setBagageForm({ poidsKg: '20', description: '' }); toast.success('Billet émis et encaissé.'); setSiege(null)
    } catch (e) { const message = e.response?.data?.message || e.message || 'La vente n’a pas abouti.'; setError(message); toast.error(message) }
    finally { setBusy(false) }
  }

  const enregistrerBagage = async (event) => {
    event.preventDefault()
    if (!ticketId || !Number.isFinite(poidsBagage) || poidsBagage <= 0) return
    setBagageSaving(true)
    try {
      const response = dataOf(await bagageApi.enregistrer({ idBillet: ticketId, poidsKg: poidsBagage, description: bagageForm.description.trim() || null }))
      setBagage(response)
      toast.success(`Bagage enregistré · étiquette ${response.numeroEtiquette}`)
    } catch (e) {
      const message = e.response?.data?.message || 'Impossible d’enregistrer le bagage.'
      setError(message); toast.error(message)
    } finally { setBagageSaving(false) }
  }

  return <div className="ticket-office-page"><header className="office-heading"><div><span className="office-eyebrow">ESPACE GUICHET</span><h1>Billetterie</h1><p>Vente de billets à partir des départs et tarifs publiés par l’agence.</p></div>{canUseCash && <div className={`office-cash-state ${session?.idCloture ? 'is-open' : ''}`}><i />{session?.idCloture ? `Caisse ouverte · ${session.nomAgence || ''}` : 'Caisse fermée'}</div>}</header>
    {error && <div className="office-alert" role="alert">{error}<button type="button" aria-label="Fermer" onClick={() => setError('')}>×</button></div>}
    {canUseCash && !session?.idCloture && <div className="cash-session-warning"><Clock3 size={15} /> Une session de caisse est obligatoire pour une vente en espèces. <button type="button" className="button-primary" onClick={openCashSession} disabled={busy}>{busy ? 'Ouverture…' : 'Ouvrir la caisse'}</button></div>}
    <div className="ticket-office-grid"><section className="departures-panel"><div className="panel-heading"><div><span className="office-eyebrow">DÉPARTS DISPONIBLES</span><h2>Choisir un voyage</h2></div><button className="icon-link-button" type="button" onClick={() => window.location.reload()} title="Actualiser les départs"><RefreshCw size={15} /></button></div>{loading ? <div className="office-empty"><LoaderCircle className="spin" /> Chargement…</div> : voyages.length ? <div className="departure-list">{voyages.map((item) => <button type="button" key={item.idVoyage} className={`departure-card ${voyage?.idVoyage === item.idVoyage ? 'is-selected' : ''}`} onClick={() => selectVoyage(item)}><span className="departure-time">{when(item.dateHeureDepartPrevue)}</span><span className="departure-main"><strong>{item.villeDepart} <ArrowRight size={13} /> {item.villeArrivee}</strong><small><BusFront size={13} /> {item.busImmatriculation || 'Bus non renseigné'} · {item.classeBus || 'Classe non renseignée'}</small></span><span className="departure-price"><strong>{money.format(item.tarifBaseXaf || 0)} <small>XAF</small></strong><span>{item.placesRestantes ?? '—'} places libres</span></span></button>)}</div> : <div className="office-empty">Aucun voyage disponible dans le système.</div>}</section>
      <section className="booking-panel"><div className="panel-heading"><div><span className="office-eyebrow">VENTE DE BILLET</span><h2>{voyage ? 'Choisir une place' : 'Sélectionnez un voyage'}</h2></div><Ticket size={18} /></div>{voyage && <><div className="selected-trip"><MapPin size={15} /><span>{voyage.villeDepart} → {voyage.villeArrivee}</span><small>{when(voyage.dateHeureDepartPrevue)} · {voyage.busImmatriculation || 'Bus non renseigné'}</small></div>{!sieges ? <div className="seat-loading"><LoaderCircle className="spin" size={15} /> Chargement des places…</div> : <><div className="seat-select-block"><div className="seat-heading"><strong>Plan des places</strong><span><i /> Libre <i className="locked-dot" /> Verrouillé <i className="occupied-dot" /> Occupé</span></div><div className="seat-grid">{Array.from({ length: Number(sieges.totalPlaces || 0) }, (_, i) => i + 1).map((number) => { const isFree = freeSeats.has(number); const isLocked = lockedSeats.has(number) && Number(seatLock?.numSiege) !== number; const isSelected = Number(siege) === number; return <button key={number} type="button" aria-label={`Siège ${number}${isSelected ? ', verrouillé pour vous' : isFree ? ', libre' : isLocked ? ', verrouillé' : ', occupé'}`} disabled={!isFree && !isSelected} className={`seat-button ${isFree ? 'is-free' : ''} ${isLocked ? 'is-locked' : ''} ${isSelected ? 'is-current' : ''}`} onClick={() => handleSeatSelect(number)}>{isLocked ? <LockKeyhole size={11} /> : number}</button> })}</div></div>{seatLock && <div className="seat-lock-countdown" role="status"><LockKeyhole size={14} /><span>Siège réservé pour vous — <strong>{formatCountdown(remainingSeconds)}</strong> restantes</span></div>}</>}
        {paymentSession ? <MonetbilWidgetForm paymentUrl={paymentSession.paymentUrl} /> : <form className="booking-form" onSubmit={sell}><div className="form-section-caption">PASSAGER</div><div className="passenger-grid"><label>Prénom<input required maxLength={50} value={passager.prenom} onChange={(e) => setPassager({ ...passager, prenom: e.target.value })} /></label><label>Nom<input required maxLength={50} value={passager.nom} onChange={(e) => setPassager({ ...passager, nom: e.target.value })} /></label><label>Téléphone<input required type="tel" maxLength={20} value={passager.telephone} onChange={(e) => setPassager({ ...passager, telephone: e.target.value })} /></label><label>CNI / passeport<input value={passager.cni} onChange={(e) => setPassager({ ...passager, cni: e.target.value })} /></label></div><div className="form-section-caption">PAIEMENT</div><div className="payment-choice-grid"><button className={`payment-choice ${mode === 'ESPECES' ? 'is-selected' : ''}`} type="button" onClick={() => setMode('ESPECES')}><span>Espèces<small>Encaissement guichet</small></span><i /></button><button className={`payment-choice ${mode === 'MONETBIL' ? 'is-selected' : ''}`} type="button" onClick={() => setMode('MONETBIL')}><span>Mobile Money<small>MTN MoMo ou Orange Money</small></span><i /></button></div>{mode === 'MONETBIL' && <PaymentOperatorChoice compact value={operateur} onChange={setOperateur} />}<button className="booking-submit" disabled={!voyage || !siege || !price || busy || (mode === 'ESPECES' && canUseCash && !session?.idCloture)}>{busy ? <><LoaderCircle className="spin" size={16} /> Traitement…</> : <><span>{mode === 'MONETBIL' ? 'Continuer vers Monetbil' : 'Valider la vente'}</span><strong>{money.format(price)} XAF</strong></>}</button></form>}
      </>}</section></div>
    {ticket && <section className="staff-ticket-result"><div className="staff-ticket-toolbar"><div><CheckCircle2 size={17} /> Billet confirmé <span>{ticket.codeBillet}</span></div><button type="button" onClick={() => window.print()}><Printer size={15} /> Imprimer</button></div><article className="print-ticket" id="billet-print"><div className="print-ticket-top"><div className="print-ticket-brand"><img src="/god-travel-logo.jpg" alt="" /><div><strong>GOD TRAVEL</strong><span>UNITED EXPRESS · CAMEROUN</span></div></div><div className="ticket-status-stamp">{ticket.statut}</div></div><div className="print-ticket-route"><div><small>DÉPART</small><strong>{ticket.villeDepart}</strong><span>{when(ticket.departPrevu)}</span></div><ArrowRight size={20} /><div><small>ARRIVÉE</small><strong>{ticket.villeArrivee}</strong><span>Voyage interurbain</span></div></div><div className="print-ticket-details"><div><small>PASSAGER</small><strong>{ticket.nomPassager}</strong></div><div><small>SIÈGE</small><strong>{ticket.numeroSiege}</strong></div><div><small>RÉFÉRENCE</small><strong>{ticket.codeBillet}</strong></div><div><small>MONTANT</small><strong>{money.format(ticket.montantXaf)} XAF</strong></div></div><div className="print-ticket-bottom"><img src={`data:image/png;base64,${ticket.qrCodeBase64}`} alt="QR du billet" /><div><strong>Présentez ce code à l’embarquement.</strong><span>Billet de transport God Travel.</span></div></div></article>
      {ticketId && <section className="baggage-registration" aria-labelledby="baggage-heading"><div className="baggage-heading"><div><span className="office-eyebrow">BAGAGES</span><h3 id="baggage-heading">Enregistrer un bagage</h3><p>Un bagage est autorisé par billet. La franchise est de 20 kg.</p></div><PackageCheck size={20} /></div>{bagage ? <div className="baggage-confirmed"><CheckCircle2 size={18} /><div><strong>Bagage enregistré · {bagage.numeroEtiquette}</strong><span>{bagage.poidsKg} kg · {money.format(bagage.fraisSupplementairesXaf || 0)} XAF de supplément</span></div></div> : <form className="baggage-form" onSubmit={enregistrerBagage}><label>Poids du bagage (kg)<input required type="number" min="0.01" max="999.99" step="0.01" value={bagageForm.poidsKg} onChange={(e) => setBagageForm((current) => ({ ...current, poidsKg: e.target.value }))} /></label><label>Description (facultatif)<input maxLength={100} value={bagageForm.description} onChange={(e) => setBagageForm((current) => ({ ...current, description: e.target.value }))} placeholder="Ex. valise bleue" /></label><div className="baggage-fee"><span>{fraisBagage > 0 ? 'Supplément excédent' : 'Franchise jusqu’à 20 kg'}</span><strong>{fraisBagage > 0 ? `${money.format(fraisBagage)} XAF` : 'Aucun supplément'}</strong></div><button className="button-primary" disabled={busy || bagageSaving || !Number.isFinite(poidsBagage) || poidsBagage <= 0}>{bagageSaving ? 'Enregistrement…' : 'Confirmer le bagage'} <ArrowRight size={15} /></button></form>}</section>}
    </section>}
  </div>
}
