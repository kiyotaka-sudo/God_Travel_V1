import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bus, CheckCircle2, Clock3, LoaderCircle, RefreshCw, ScanLine, Users, XCircle } from 'lucide-react'
import { billetterieApi, embarquementApi } from '@api/index'
import { parseCmInstant } from '@utils/domain'

const asData = (response) => response?.data?.data
const VALID_TICKET_STATUSES = new Set(['VALIDE', 'EMBARQUE'])
const DEPARTURE_STATUSES = new Set(['PROGRAMME', 'EN_COURS'])

function doualaDayKey(date) {
  const parts = new Intl.DateTimeFormat('fr-CA', {
    timeZone: 'Africa/Douala', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const part = (type) => parts.find((item) => item.type === type)?.value || ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

function departureDayKey(value) {
  const timestamp = parseCmInstant(value)
  return Number.isFinite(timestamp) ? doualaDayKey(new Date(timestamp)) : ''
}

function formatDeparture(value) {
  const timestamp = parseCmInstant(value)
  if (!Number.isFinite(timestamp)) return 'Horaire non renseigné'
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Africa/Douala', weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(timestamp))
}

function formatScanTime(value) {
  const timestamp = parseCmInstant(value)
  return Number.isFinite(timestamp)
    ? new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp))
    : '—'
}

function passengerName(passager) {
  return [passager.passagerPrenom, passager.passagerNom].filter(Boolean).join(' ') || 'Passager non renseigné'
}

function isBoarded(passager) {
  return String(passager.statutBillet || '').toUpperCase() === 'EMBARQUE' && passager.estConforme !== false
}

function hasSignatureIssue(passager) {
  return Boolean(passager.idEmbarquement) && passager.estConforme === false
}

function statusLabel(passager) {
  if (hasSignatureIssue(passager)) return 'Signature à vérifier'
  return isBoarded(passager) ? 'Embarqué' : passager.statutBillet || 'Statut inconnu'
}

export default function HotessePage() {
  const [voyages, setVoyages] = useState([])
  const [voyageId, setVoyageId] = useState('')
  const [manifeste, setManifeste] = useState([])
  const [codeBillet, setCodeBillet] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [voyagesLoading, setVoyagesLoading] = useState(true)
  const [manifesteLoading, setManifesteLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [pageError, setPageError] = useState('')
  const [manifesteError, setManifesteError] = useState('')
  const scanInput = useRef(null)

  const fetchManifeste = useCallback(async (id) => {
    const response = await embarquementApi.getManifeste(id)
    const data = asData(response)
    return Array.isArray(data) ? data : []
  }, [])

  useEffect(() => {
    let active = true
    const today = doualaDayKey(new Date())
    billetterieApi.getVoyages()
      .then((response) => {
        if (!active) return
        const list = (asData(response) || [])
          .filter((trip) => DEPARTURE_STATUSES.has(String(trip.statutVoyage || '').toUpperCase())
            && departureDayKey(trip.dateHeureDepartPrevue) === today)
          .sort((left, right) => parseCmInstant(left.dateHeureDepartPrevue) - parseCmInstant(right.dateHeureDepartPrevue))
        setVoyages(list)
        setVoyageId((current) => list.some((trip) => trip.idVoyage === current) ? current : list[0]?.idVoyage || '')
      })
      .catch((error) => {
        if (active) setPageError(error.response?.data?.message || 'Impossible de charger les voyages du jour.')
      })
      .finally(() => { if (active) setVoyagesLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!voyageId) {
      setManifeste([])
      setManifesteError('')
      setManifesteLoading(false)
      return undefined
    }
    let active = true
    setManifeste([])
    setManifesteError('')
    setScanResult(null)
    setManifesteLoading(true)
    fetchManifeste(voyageId)
      .then((rows) => { if (active) setManifeste(rows) })
      .catch((error) => { if (active) setManifesteError(error.response?.data?.message || 'Le manifeste ne peut pas être chargé.') })
      .finally(() => { if (active) setManifesteLoading(false) })
    return () => { active = false }
  }, [voyageId, fetchManifeste])

  const voyage = useMemo(() => voyages.find((trip) => trip.idVoyage === voyageId) || null, [voyages, voyageId])
  const validTickets = useMemo(() => manifeste.filter((row) => VALID_TICKET_STATUSES.has(String(row.statutBillet || '').toUpperCase())), [manifeste])
  const boardedCount = useMemo(() => validTickets.filter(isBoarded).length, [validTickets])
  const progress = validTickets.length ? Math.round((boardedCount / validTickets.length) * 100) : 0

  const refreshManifeste = async () => {
    if (!voyageId) return
    setRefreshing(true)
    setManifesteError('')
    try { setManifeste(await fetchManifeste(voyageId)) }
    catch (error) { setManifesteError(error.response?.data?.message || 'Le manifeste ne peut pas être actualisé.') }
    finally { setRefreshing(false) }
  }

  const validateBoarding = async (event) => {
    event.preventDefault()
    const code = codeBillet.trim().toUpperCase()
    if (!code.startsWith('GT-') || code.length < 8) {
      setScanResult({ type: 'error', message: 'Saisissez un code billet commençant par GT- et contenant au moins 8 caractères.' })
      return
    }

    const passenger = manifeste.find((row) => String(row.codeBillet || '').toUpperCase() === code)
    if (!passenger) {
      setScanResult({ type: 'error', message: 'Ce billet ne figure pas dans le manifeste du voyage sélectionné.' })
      return
    }

    setBusy(true)
    setScanResult(null)
    setManifesteError('')
    try {
      const response = await embarquementApi.validerEmbarquement({ codeBillet: code, terminalScan: 'WEB-HOTESSE' })
      const result = asData(response) || {}
      const conform = result.estConforme === true
      setScanResult({
        type: conform ? 'success' : 'error',
        seat: passenger.numSiege,
        message: response.data?.message || (conform ? 'Embarquement validé.' : 'Signature du billet non conforme.'),
      })
      setCodeBillet('')
      try { setManifeste(await fetchManifeste(voyageId)) }
      catch (error) { setManifesteError(error.response?.data?.message || 'Le scan est enregistré, mais le manifeste n’a pas pu être actualisé.') }
      scanInput.current?.focus()
    } catch (error) {
      setScanResult({
        type: 'error',
        seat: passenger.numSiege,
        message: error.response?.data?.message || 'Le billet ne peut pas être embarqué. Vérifiez son statut et réessayez.',
      })
    } finally {
      setBusy(false)
    }
  }

  return <div className="boarding-page">
    <header className="boarding-heading">
      <span className="admin-eyebrow">ESPACE HÔTESSE</span>
      <h1>Embarquement</h1>
      <p>Vérifiez chaque billet et suivez l’embarquement des passagers du jour.</p>
    </header>

    {pageError && <div className="boarding-alert" role="alert">{pageError}</div>}

    <section className="boarding-trip-panel" aria-label="Sélection du voyage">
      <label className="boarding-trip-select" htmlFor="boarding-trip">
        <span>Voyage du jour</span>
        <select id="boarding-trip" value={voyageId} onChange={(event) => { setVoyageId(event.target.value); setScanResult(null); setCodeBillet('') }} disabled={voyagesLoading || voyages.length === 0}>
          {voyages.length === 0 && <option value="">Aucun voyage disponible aujourd’hui</option>}
          {voyages.map((trip) => <option key={trip.idVoyage} value={trip.idVoyage}>{trip.villeDepart} → {trip.villeArrivee} · {formatDeparture(trip.dateHeureDepartPrevue)}</option>)}
        </select>
      </label>
      {voyage && <div className="boarding-trip-meta"><Bus size={18} /><span><strong>{voyage.codeVoyage || `${voyage.villeDepart} → ${voyage.villeArrivee}`}</strong><small>{voyage.busImmatriculation || 'Bus non renseigné'} · {formatDeparture(voyage.dateHeureDepartPrevue)}</small></span></div>}
      {voyagesLoading && <LoaderCircle className="spin boarding-loading-icon" size={18} aria-label="Chargement des voyages" />}
    </section>

    {!voyagesLoading && voyages.length === 0 && !pageError && <div className="boarding-empty"><Bus size={24} /><strong>Aucun voyage prévu aujourd’hui</strong><span>Les départs programmés ou en cours apparaîtront ici.</span></div>}

    {voyage && <>
      <section className="boarding-progress-panel" aria-label="Progression de l’embarquement">
        <div className="boarding-progress-icon"><Users size={20} /></div>
        <div className="boarding-progress-copy"><span>PASSAGERS EMBARQUÉS</span><strong><b>{boardedCount}</b><i>/</i>{validTickets.length}</strong><small>{boardedCount} embarqués / {validTickets.length} billets valides</small></div>
        <div className="boarding-progress-track" role="progressbar" aria-label="Progression de l’embarquement" aria-valuemin={0} aria-valuemax={validTickets.length} aria-valuenow={boardedCount}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <strong className="boarding-progress-percent">{progress}%</strong>
      </section>

      <section className="boarding-scan-panel">
        <div className="boarding-panel-heading"><div><span className="admin-eyebrow">CONTRÔLE DU BILLET</span><h2>Scanner un passager</h2></div><span className="boarding-scan-heading-icon"><ScanLine size={19} /></span></div>
        <form className="boarding-scan-form" onSubmit={validateBoarding}>
          <label htmlFor="boarding-code">Code du billet
            <input ref={scanInput} id="boarding-code" type="text" inputMode="text" autoComplete="off" autoCapitalize="characters" minLength={8} maxLength={30} value={codeBillet} onChange={(event) => { setCodeBillet(event.target.value); setScanResult(null) }} placeholder="GT-2611-12-ABCDE" aria-describedby="boarding-code-hint" required />
            <small id="boarding-code-hint">Entrez ou scannez le code imprimé sur le billet (préfixe GT-).</small>
          </label>
          <button type="submit" className="boarding-submit" disabled={!voyage || busy || codeBillet.trim().length < 8}>
            {busy ? <LoaderCircle className="spin" size={17} /> : <ScanLine size={17} />}
            {busy ? 'Vérification…' : 'Valider l’embarquement'}
          </button>
        </form>
        {scanResult && <div className={`boarding-result ${scanResult.type === 'success' ? 'is-success' : 'is-error'}`} role={scanResult.type === 'success' ? 'status' : 'alert'} aria-live="polite">
          {scanResult.type === 'success' ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
          <div><strong>{scanResult.type === 'success' ? 'Embarquement confirmé' : 'Embarquement refusé'}</strong><span>{scanResult.seat != null ? `Siège ${scanResult.seat} · ` : ''}{scanResult.message}</span></div>
        </div>}
      </section>

      <section className="boarding-manifest-panel">
        <div className="boarding-panel-heading"><div><span className="admin-eyebrow">LISTE D’APPEL</span><h2>Manifeste des passagers</h2></div><button type="button" className="boarding-refresh" onClick={refreshManifeste} disabled={refreshing || manifesteLoading} aria-label="Actualiser le manifeste" title="Actualiser le manifeste">{refreshing || manifesteLoading ? <LoaderCircle className="spin" size={16} /> : <RefreshCw size={16} />}</button></div>
        {manifesteError && <div className="boarding-alert" role="alert">{manifesteError}</div>}
        {manifesteLoading ? <div className="boarding-list-loading"><LoaderCircle className="spin" size={18} /> Chargement du manifeste…</div> : manifeste.length === 0 ? <div className="boarding-list-empty">Aucun billet n’est associé à ce voyage.</div> : <div className="boarding-table-wrap"><table className="boarding-table">
          <thead><tr><th>Siège</th><th>Passager</th><th>CNI</th><th>Statut</th><th><Clock3 size={13} /> Heure scan</th></tr></thead>
          <tbody>{manifeste.map((passager) => {
            const boarded = isBoarded(passager)
            const issue = hasSignatureIssue(passager)
            return <tr key={passager.idBillet} className={`${boarded ? 'is-boarded' : ''} ${issue ? 'has-signature-issue' : ''}`}>
              <td className="boarding-seat-cell">{passager.numSiege ?? '—'}</td>
              <td><strong>{passengerName(passager)}</strong><small>{passager.codeBillet}</small></td>
              <td>{passager.numeroCni || '—'}</td>
              <td><span className={`boarding-status ${boarded ? 'is-boarded' : issue ? 'is-invalid' : ''}`}>{boarded && <CheckCircle2 size={14} />}{issue && <XCircle size={14} />}{statusLabel(passager)}</span></td>
              <td>{passager.dateHeureScan ? formatScanTime(passager.dateHeureScan) : '—'}</td>
            </tr>
          })}</tbody>
        </table></div>}
      </section>
    </>}
  </div>
}
