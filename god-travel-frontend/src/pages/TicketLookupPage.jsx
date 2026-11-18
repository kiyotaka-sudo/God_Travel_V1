import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BusFront, CheckCircle2, Printer, Search, ShieldCheck } from 'lucide-react'
import { billetterieApi } from '@api/index'
import { parseCmInstant } from '@utils/domain'

const money = new Intl.NumberFormat('fr-FR')

export default function TicketLookupPage() {
  const [searchParams] = useSearchParams()
  const [codeBillet, setCodeBillet] = useState(searchParams.get('code') || '')
  const [telephone, setTelephone] = useState('')
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const consulter = async (event) => {
    event.preventDefault()
    setLoading(true); setError(''); setTicket(null)
    try {
      const response = await billetterieApi.consulterBillet(codeBillet.trim(), telephone.trim())
      setTicket(response.data?.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Billet introuvable. Vérifiez le code et le téléphone utilisés lors de l’achat.')
    } finally { setLoading(false) }
  }

  return (
    <main className="ticket-lookup-page">
      <header className="ticket-public-nav"><Link to="/" className="landing-wordmark"><img src="/god-travel-logo.jpg" alt="" /><span>GOD<span>TRAVEL</span></span></Link><Link to="/" className="ticket-back-link"><ArrowLeft size={15} /> Accueil</Link></header>
      <section className="ticket-lookup-main">
        <div className="ticket-intro"><div className="ticket-kicker"><span /> BILLETTERIE · SERVICE CLIENT</div><h1>Votre billet,<br /><em>toujours à portée.</em></h1><p>Retrouvez votre réservation et imprimez votre reçu. Pour protéger vos données, nous vérifions aussi le numéro de téléphone de l’acheteur.</p></div>
        <div className="ticket-lookup-card">
          <div className="ticket-card-heading"><div className="ticket-icon"><Search size={19} /></div><div><strong>Retrouver un billet</strong><span>Code billet et téléphone d’achat</span></div></div>
          <form onSubmit={consulter} className="ticket-lookup-form"><label>Code du billet<input required autoCapitalize="characters" placeholder="GT-1806-12-ABCDE" value={codeBillet} onChange={(event) => setCodeBillet(event.target.value.toUpperCase())} /></label><label>Téléphone de l’acheteur<input required type="tel" autoComplete="tel" placeholder="6 99 00 00 00" value={telephone} onChange={(event) => setTelephone(event.target.value)} /></label><button type="submit" disabled={loading}>{loading ? 'Recherche…' : 'Consulter mon billet'} <ArrowRight size={17} /></button></form>
          {error && <p className="ticket-error" role="alert">{error}</p>}
          <div className="ticket-privacy"><ShieldCheck size={15} /> Le numéro sert uniquement à vérifier que le billet vous appartient.</div>
        </div>
      </section>
      {ticket && <section className="ticket-result-area"><div className="ticket-result-tools"><div className="ticket-confirmed"><CheckCircle2 size={18} /><span>Billet confirmé <small>· Paiement validé</small></span></div><button onClick={() => window.print()} className="ticket-print-button"><Printer size={16} /> Imprimer le billet</button></div>
        <article className="print-ticket" id="billet-print">
          <div className="print-ticket-top"><div className="print-ticket-brand"><img src="/god-travel-logo.jpg" alt="" /><div><strong>GOD TRAVEL</strong><span>UNITED EXPRESS · CAMEROUN</span></div></div><div className="ticket-status-stamp">VALIDÉ</div></div>
          <div className="print-ticket-route"><div><small>DÉPART</small><strong>{ticket.villeDepart}</strong><span>{new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', dateStyle: 'long', timeStyle: 'short' }).format(new Date(parseCmInstant(ticket.departPrevu)))}</span></div><ArrowRight size={21} /><div><small>ARRIVÉE</small><strong>{ticket.villeArrivee}</strong><span>Voyage interurbain</span></div></div>
          <div className="print-ticket-rule" />
          <div className="print-ticket-details"><div><small>PASSAGER</small><strong>{ticket.nomPassager}</strong></div><div><small>SIÈGE</small><strong>{ticket.numeroSiege}</strong></div><div><small>BUS</small><strong>{ticket.immatriculationBus}</strong></div><div><small>RÉFÉRENCE</small><strong>{ticket.codeBillet}</strong></div><div><small>MONTANT PAYÉ</small><strong>{money.format(ticket.montantXaf)} XAF</strong></div><div><small>RÉSERVATION</small><strong>{ticket.codeReservation}</strong></div></div>
          <div className="print-ticket-bottom"><img src={`data:image/png;base64,${ticket.qrCodeBase64}`} alt="Code de contrôle du billet" /><div><strong>Présentez ce code à l’embarquement.</strong><span>Conservez votre billet pendant le voyage.</span><span>Contact agence · Yaoundé / Douala</span></div></div>
        </article>
      </section>}
      <footer className="ticket-public-footer"><span>GOD TRAVEL · UNITED EXPRESS</span><span><BusFront size={13} /> YAOUNDÉ — DOUALA</span></footer>
    </main>
  )
}
