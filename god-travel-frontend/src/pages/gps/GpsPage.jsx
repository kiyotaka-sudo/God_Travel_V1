import { useCallback, useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { AlertTriangle, Check, LoaderCircle, MapPinned, RefreshCw, Radio } from 'lucide-react'
import { gpsApi } from '@api/index'
import CityShareFleetMap from '@components/maps/CityShareFleetMap'
import { parseCmInstant } from '@utils/domain'

const dataOf = (response) => response?.data?.data || []
const formatter = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', dateStyle: 'short', timeStyle: 'short' })

export default function GpsPage() {
  const [positions, setPositions] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true); else setLoading(true)
    setError('')
    try {
      const [positionResponse, alertResponse] = await Promise.all([gpsApi.getPositions(), gpsApi.getAlertes()])
      setPositions(dataOf(positionResponse)); setAlerts(dataOf(alertResponse))
    } catch (e) { setError(e.response?.data?.message || 'Les données GPS ne sont pas disponibles. Vérifiez les droits et la connexion API.') }
    finally { setLoading(false); setRefreshing(false) }
  }, [])
  useEffect(() => { load(); const timer = window.setInterval(() => load(true), 15_000); return () => window.clearInterval(timer) }, [load])

  const acknowledge = async (alert) => {
    try { await gpsApi.acquitterAlerte(alert.idAlerteGps); setAlerts((current) => current.filter((item) => item.idAlerteGps !== alert.idAlerteGps)) }
    catch (e) { setError(e.response?.data?.message || 'Cette alerte n’a pas pu être acquittée.') }
  }
  const valid = positions.filter((point) => {
    const instant = parseCmInstant(point.dateHeureReleve)
    return Number.isFinite(Number(point.latitude)) && Number.isFinite(Number(point.longitude)) && Number.isFinite(instant) && Date.now() >= instant && Date.now() - instant <= 5 * 60 * 1000
  })
  const center = valid.length ? [Number(valid[0].latitude), Number(valid[0].longitude)] : [3.9, 10.65]
  return <main className="gps-page"><header className="office-heading"><div><span className="office-eyebrow">SUIVI DE FLOTTE</span><h1>Positions GPS</h1><p>Dernières positions reçues par le backend, actualisées automatiquement.</p></div><button className="gps-refresh" type="button" onClick={() => load(true)} disabled={refreshing}><RefreshCw size={15} className={refreshing ? 'spin' : ''} /> Actualiser</button></header>
    {error && <div className="office-alert" role="alert">{error}</div>}
    <div className="gps-summary"><div><MapPinned size={17} /><span>Positions affichées</span><strong>{valid.length}</strong></div><div><AlertTriangle size={17} /><span>Alertes actives</span><strong>{alerts.length}</strong></div><div><Radio size={17} /><span>Dernière remontée</span><strong>{valid[0]?.dateHeureReleve ? formatter.format(new Date(valid[0].dateHeureReleve)) : 'Aucune'}</strong></div></div>
    <div className="gps-content-grid"><section className="gps-map-panel"><div className="panel-heading"><div><span className="office-eyebrow">CARTE</span><h2>Positions reçues</h2></div><span>{valid.length ? 'Données API' : 'Aucune position'}</span></div>{loading ? <div className="gps-map-empty"><LoaderCircle className="spin" /> Chargement des positions…</div> : valid.length ? <CityShareFleetMap points={valid} center={center} formatter={formatter} /> : <div className="gps-map-empty"><MapPinned size={24} /><strong>Aucune position GPS reçue</strong><span>La carte s’affichera dès que le backend enregistrera un pointage.</span></div>}</section>
      <aside className="gps-alert-panel"><div className="panel-heading"><div><span className="office-eyebrow">INCIDENTS SIGNALÉS</span><h2>Alertes GPS</h2></div><span>{alerts.length}</span></div>{loading ? <div className="office-empty"><LoaderCircle className="spin" /></div> : alerts.length ? <div className="gps-alert-list">{alerts.map((alert) => <article key={alert.idAlerteGps}><span className="gps-alert-icon"><AlertTriangle size={16} /></span><div><strong>{alert.typeAlerte}</strong><p>{alert.messageAlerte}</p><small>{alert.dateHeureAlerte ? formatter.format(new Date(alert.dateHeureAlerte)) : 'Date non renseignée'}</small></div>{!alert.estAcquittee && <button type="button" onClick={() => acknowledge(alert)} aria-label="Acquitter cette alerte"><Check size={15} /></button>}</article>)}</div> : <div className="office-empty">Aucune alerte GPS active.</div>}</aside>
    </div>
  </main>
}
