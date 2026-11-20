const OPERATORS = [
  { code: 'MTN', label: 'MTN Mobile Money', image: '/mtn-mobile-money.png', tone: 'mtn' },
  { code: 'ORANGE', label: 'Orange Money', image: '/orange-money.png', tone: 'orange' },
]

export default function PaymentOperatorChoice({ value, onChange, compact = false }) {
  return <fieldset className={`payment-operator-select ${compact ? 'is-compact' : ''}`}>
    <legend>Choisissez votre opérateur</legend>
    {OPERATORS.map((operator) => <label key={operator.code} className={value === operator.code ? 'is-selected' : ''}>
      <input type="radio" name="operateur" value={operator.code} checked={value === operator.code} onChange={() => onChange(operator.code)} />
      <span className={`payment-operator-logo is-${operator.tone}`}><img src={operator.image} alt="" /></span>
      <span className="payment-operator-copy"><strong>{operator.label}</strong><small>Paiement sécurisé via Monetbil</small></span>
      <i aria-hidden="true" />
    </label>)}
  </fieldset>
}
