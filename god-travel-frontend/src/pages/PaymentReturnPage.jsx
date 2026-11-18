import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock3, LoaderCircle, ShieldCheck, X } from 'lucide-react'
import { paymentApi } from '@api/index'

export default function PaymentReturnPage() {
  const [params] = useSearchParams()
  const reference = params.get('reference') || sessionStorage.getItem('god-travel-payment-reference') || ''
  const [telephone, setTelephone] = useState('')
  const [status, setStatus] = useState('IDLE')
  const [message, setMessage] = useState('Saisissez le numéro utilisé lors du paiement pour vérifier son statut.')
  const [codeBillet, setCodeBillet] = useState('')
  const [checking, setChecking] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!checking || !telephone || !reference) return undefined
    let active = true
    let timer
    let tries = 0
    const poll = async () => {
      if (!active) return
      tries += 1; setAttempt(tries)
      try {
        const response = await paymentApi.getStatutMonetbil(reference, telephone)
        if (!active) return
        const data = response.data?.data
        const current = data?.statut || 'EN_ATTENTE'
        setStatus(current); setMessage(data?.message || 'Confirmation de l’opérateur en attente.'); setCodeBillet(data?.codeBillet || '')
        if (current === 'VALIDE') { setChecking(false); sessionStorage.removeItem('god-travel-payment-reference'); return }
        if (current === 'ECHEC') { setChecking(false); sessionStorage.removeItem('god-travel-payment-reference'); return }
        if (tries >= 9) { setChecking(false); setMessage('La confirmation prend plus de temps que prévu. Vous pouvez relancer la vérification sans recommencer le paiement.') ; return }
        timer = window.setTimeout(poll, Math.min(30_000, 2500 * (2 ** Math.max(0, tries - 1))))
      } catch (error) {
        if (!active) return
        setStatus('ERREUR'); setMessage(error.response?.data?.message || 'Impossible de vérifier la transaction. Vérifiez le numéro et réessayez.'); setChecking(false)
      }
    }
    poll()
    return () => { active = false; window.clearTimeout(timer) }
  }, [checking, telephone, reference])

  const submit = (event) => { event.preventDefault(); setAttempt(0); setStatus('EN_ATTENTE'); setMessage('Nous vérifions le statut auprès du serveur.'); setChecking(true) }
  const isSuccess = status === 'VALIDE'
  const isFailure = status === 'ECHEC' || status === 'ERREUR'
  return <main className="payment-return-page"><header className="ticket-public-nav"><Link to="/" className="landing-wordmark"><img src="/god-travel-logo.jpg" alt="" /><span>God-<span>travel</span></span></Link><Link to="/" className="ticket-back-link"><ArrowLeft size={15} /> Accueil</Link></header><section className="payment-return-card">
    <nav className="booking-steps payment-steps" aria-label="Progression de réservation">{['Départ', 'Siège', 'Passager', 'Paiement', 'Billet'].map((name, index) => <div key={name} className={`booking-step ${index < (isSuccess ? 5 : 4) ? 'is-complete' : 'is-current'}`}><span>{index < (isSuccess ? 5 : 4) ? <Check size={13} /> : index + 1}</span><b>{name}</b></div>)}</nav>
    <div className={`payment-result-icon ${isSuccess ? 'is-success' : isFailure ? 'is-failure' : ''}`}>{isSuccess ? <Check /> : isFailure ? <X /> : checking ? <LoaderCircle className="spin" /> : <Clock3 />}</div><div className="ticket-kicker">PAIEMENT · {reference ? `RÉF. ${reference}` : 'RETOUR MONETBIL'}</div><h1>{isSuccess ? 'Paiement confirmé.' : isFailure ? 'Paiement non confirmé.' : 'Vérifions votre paiement.'}</h1><p>{message}</p>
    {reference ? <form className="payment-check-form" onSubmit={submit}><label>Téléphone utilisé pour le paiement<input type="tel" autoComplete="tel" required value={telephone} onChange={(event) => setTelephone(event.target.value)} placeholder="6 99 00 00 00" /></label><button type="submit" disabled={checking}>{checking ? <><LoaderCircle className="spin" size={16} /> Vérification…</> : 'Vérifier le paiement'}</button></form> : <div className="payment-no-reference">Aucune référence n’a été transmise. Si vous avez effectué le paiement, retrouvez le billet avec son code ou contactez l’agence.</div>}
    {isSuccess && codeBillet && <Link className="payment-ticket-link" to={`/billet?code=${encodeURIComponent(codeBillet)}`}>Consulter et imprimer le billet <ArrowRight size={15} /></Link>}
    {isFailure && <Link className="payment-ticket-link" to="/reserver">Recommencer une réservation <ArrowRight size={15} /></Link>}
    {checking && attempt > 0 && <small className="payment-poll-note">Vérification {attempt} sur 9 · vous pouvez laisser cette page ouverte.</small>}
    <div className="ticket-privacy"><ShieldCheck size={15} /> Seule la confirmation transmise au serveur valide le billet.</div>
  </section></main>
}
