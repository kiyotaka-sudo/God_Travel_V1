import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Clock3, LoaderCircle, ShieldCheck, X } from 'lucide-react'
import { paymentApi } from '@api/index'

export default function PaymentReturnPage() {
  const [params] = useSearchParams()
  const reference = params.get('reference') || ''
  const [telephone, setTelephone] = useState('')
  const [status, setStatus] = useState('IDLE')
  const [message, setMessage] = useState('Saisissez le numéro utilisé sur Monetbil pour vérifier le paiement.')
  const [codeBillet, setCodeBillet] = useState('')
  const [checking, setChecking] = useState(false)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!checking || !telephone || !reference) return undefined
    let active = true
    const check = async () => {
      try {
        const response = await paymentApi.getStatutMonetbil(reference, telephone)
        if (!active) return
        const data = response.data?.data
        setStatus(data?.statut || 'EN_ATTENTE')
        setMessage(data?.message || 'Confirmation en attente.')
        setCodeBillet(data?.codeBillet || '')
        setAttempt((value) => value + 1)
        if (data?.statut === 'VALIDE' || data?.statut === 'ECHEC') setChecking(false)
      } catch (error) {
        if (!active) return
        setStatus('ERREUR')
        setMessage(error.response?.data?.message || 'Impossible de vérifier cette transaction.')
        setChecking(false)
      }
    }
    check()
    const interval = window.setInterval(check, 5000)
    return () => { active = false; window.clearInterval(interval) }
  }, [checking, telephone, reference])

  const submit = (event) => {
    event.preventDefault()
    setStatus('EN_ATTENTE'); setAttempt(0); setChecking(true)
    setMessage('Nous attendons la confirmation sécurisée de l’opérateur.')
  }

  const isSuccess = status === 'VALIDE'
  const isFailure = status === 'ECHEC' || status === 'ERREUR'

  return (
    <main className="payment-return-page"><header className="ticket-public-nav"><Link to="/" className="landing-wordmark"><img src="/god-travel-logo.jpg" alt="" /><span>GOD<span>TRAVEL</span></span></Link><Link to="/" className="ticket-back-link"><ArrowLeft size={15} /> Accueil</Link></header><section className="payment-return-card">
      <div className={`payment-result-icon ${isSuccess ? 'is-success' : isFailure ? 'is-failure' : ''}`}>{isSuccess ? <Check /> : isFailure ? <X /> : status === 'EN_ATTENTE' ? <LoaderCircle className="spin" /> : <Clock3 />}</div>
      <div className="ticket-kicker">PAIEMENT · {reference ? `RÉF. ${reference}` : 'RETOUR MONETBIL'}</div>
      <h1>{isSuccess ? 'Paiement confirmé.' : isFailure ? 'Paiement non confirmé.' : 'Vérifions votre paiement.'}</h1>
      <p>{message}</p>
      {reference ? <form className="payment-check-form" onSubmit={submit}><label>Téléphone utilisé pour le paiement<input type="tel" required value={telephone} onChange={(event) => setTelephone(event.target.value)} placeholder="6 99 00 00 00" /></label><button type="submit" disabled={checking}>{checking ? <><LoaderCircle className="spin" size={16} /> Vérification…</> : 'Vérifier le paiement'}</button></form> : <div className="payment-no-reference">Aucune référence de paiement n’a été transmise par Monetbil.</div>}
      {isSuccess && codeBillet && <Link className="payment-ticket-link" to={`/billet?code=${encodeURIComponent(codeBillet)}`}>Consulter et imprimer le billet</Link>}
      {checking && attempt > 0 && <small className="payment-poll-note">Dernière vérification · {attempt}</small>}
      <div className="ticket-privacy"><ShieldCheck size={15} /> Un retour sur cette page ne confirme pas le paiement; seul le reçu Monetbil fait foi.</div>
    </section></main>
  )
}
