import { useEffect, useState } from 'react'
import { ExternalLink, LoaderCircle, ShieldCheck } from 'lucide-react'

const WIDGET_SCRIPT_URL = 'https://fr.monetbil.com/widget/v2/monetbil.min.js'

function isMonetbilPaymentUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'api.monetbil.com'
  } catch {
    return false
  }
}

export default function MonetbilWidgetForm({ paymentUrl }) {
  const [widgetReady, setWidgetReady] = useState(false)
  const [widgetError, setWidgetError] = useState(false)
  const validPaymentUrl = isMonetbilPaymentUrl(paymentUrl)

  useEffect(() => {
    if (!validPaymentUrl) return undefined

    let active = true
    const script = document.createElement('script')
    script.src = WIDGET_SCRIPT_URL
    script.async = true
    script.dataset.godTravelMonetbilWidget = 'true'
    script.onload = () => { if (active) setWidgetReady(true) }
    script.onerror = () => { if (active) setWidgetError(true) }
    document.body.appendChild(script)

    return () => {
      active = false
      script.remove()
    }
  }, [validPaymentUrl, paymentUrl])

  if (!validPaymentUrl) {
    return <div className="monetbil-widget-panel is-error" role="alert">L’adresse de paiement renvoyée par le serveur n’est pas valide.</div>
  }

  return <section className="monetbil-widget-panel" aria-live="polite">
    <div className="monetbil-widget-heading"><ShieldCheck size={17} /><div><strong>Paiement sécurisé Monetbil</strong><span>Référence conservée pour vérifier la confirmation.</span></div></div>
    {!widgetReady && !widgetError && <p className="monetbil-widget-status"><LoaderCircle className="spin" size={15} /> Chargement du moyen de paiement…</p>}
    {widgetError ? <div className="monetbil-widget-fallback"><p>Le widget n’a pas pu se charger. Vous pouvez ouvrir la page de paiement Monetbil.</p><a href={paymentUrl} target="_self" rel="noreferrer">Ouvrir Monetbil <ExternalLink size={14} /></a></div> : <form action={paymentUrl} method="post" data-monetbil="form" className="monetbil-widget-form">
      <button type="submit" id="monetbil-payment-widget" disabled={!widgetReady}><span>{widgetReady ? 'Ouvrir le paiement' : 'Connexion à Monetbil…'}</span><ExternalLink size={15} /></button>
    </form>}
    <p className="monetbil-widget-footnote">Le billet sera confirmé après validation du paiement par le serveur.</p>
  </section>
}
