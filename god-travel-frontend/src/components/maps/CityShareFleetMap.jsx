import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import { LocateFixed } from 'lucide-react'
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet'

const vehicleKey = (point) => point.voyage?.idVoyage || point.idBalise || point.idPosition
const busName = (point) => point.voyage?.bus?.immatriculation || point.voyage?.bus?.numeroBus || point.idBalise || point.idPosition

function isFresh(point) {
  if (!point.dateHeureReleve) return false
  const timestamp = new Date(point.dateHeureReleve).getTime()
  return Number.isFinite(timestamp) && Date.now() - timestamp < 5 * 60 * 1000
}

function busMarkerIcon(point) {
  const fresh = isFresh(point)
  const color = Number(point.vitesseKmh) > 100 ? '#c53b36' : '#14b2b6'
  const html = `<span class="cityshare-bus-pin ${fresh ? 'is-live' : ''}" style="--bus-pin-color:${color}">
    <span class="cityshare-bus-pin__pulse"></span>
    <span class="cityshare-bus-pin__body"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17V5.8A2.8 2.8 0 0 1 7.8 3h8.4A2.8 2.8 0 0 1 19 5.8V17M5 11h14M7.5 17v2m9-2v2M7.5 7.5h9M8 20h.01M16 20h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
  </span>`
  return L.divIcon({ className: 'cityshare-bus-marker', html, iconSize: [46, 46], iconAnchor: [23, 23], popupAnchor: [0, -22] })
}

function MapViewport({ points, fitKey, focusVersion }) {
  const map = useMap()
  const latestPoints = useRef(points)
  latestPoints.current = points

  useEffect(() => {
    if (!latestPoints.current.length) return
    const locations = latestPoints.current.map((point) => [Number(point.latitude), Number(point.longitude)])
    if (locations.length === 1) {
      map.flyTo(locations[0], Math.max(map.getZoom(), 10), { duration: 0.7 })
      return
    }
    map.fitBounds(L.latLngBounds(locations), { padding: [44, 44], maxZoom: 11, animate: true, duration: 0.7 })
  }, [map, fitKey, focusVersion])

  return null
}

/**
 * Leaflet adaptation of CityShareV2's CarteWeb fallback:
 * OSM tiles, live vehicle markers, pulse feedback, theme-aware tile treatment and recentering.
 */
export default function CityShareFleetMap({ points, center, formatter }) {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  const [focusVersion, setFocusVersion] = useState(0)
  const fitKey = useMemo(() => [...new Set(points.map(vehicleKey))].sort().join('|'), [points])

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setDark(root.dataset.theme === 'dark'))
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  return <div className="cityshare-map-shell">
    <MapContainer className="gps-map cityshare-map" center={center} zoom={7} scrollWheelZoom zoomControl={false}>
      <TileLayer
        className={`cityshare-map-tiles${dark ? ' cityshare-map-tiles--dark' : ''}`}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <MapViewport points={points} fitKey={fitKey} focusVersion={focusVersion} />
      {points.map((point) => <Marker key={point.idPosition || vehicleKey(point)} position={[Number(point.latitude), Number(point.longitude)]} icon={busMarkerIcon(point)}>
        <Popup className="cityshare-map-popup">
          <div className="cityshare-map-popup__content">
            <strong>{busName(point)}</strong>
            {point.voyage?.codeVoyage && <span>Voyage {point.voyage.codeVoyage}</span>}
            <span>Vitesse : {point.vitesseKmh ?? '—'} km/h</span>
            <span>{point.dateHeureReleve ? formatter.format(new Date(point.dateHeureReleve)) : 'Horodatage indisponible'}</span>
          </div>
        </Popup>
      </Marker>)}
      <ZoomControl position="bottomright" />
      <button className="cityshare-map-recenter" type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); setFocusVersion((version) => version + 1) }} title="Recentrer la carte" aria-label="Recentrer la carte">
        <LocateFixed size={17} />
      </button>
    </MapContainer>
    <div className="cityshare-map-legend" aria-label="Légende de la carte">
      <span><i /> Bus suivi</span><span><i className="is-alert" /> Survitesse</span>
    </div>
  </div>
}
