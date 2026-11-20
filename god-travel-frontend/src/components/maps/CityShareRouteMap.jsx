import { useEffect, useRef, useState } from 'react'
import { LngLatBounds, Map as MapLibreMap, Marker, NavigationControl, Popup, setWorkerUrl } from 'maplibre-gl'
import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { LocateFixed } from 'lucide-react'
import styleDay from './styles/day.json'
import styleNight from './styles/night.json'
import { parseCmInstant } from '@utils/domain'

// MapLibre's default worker URL is not resolved reliably by Vite in production builds.
// Bundle the worker through Vite so vector tiles and map layers can render.
setWorkerUrl(mapLibreWorkerUrl)

const BUS_TIMEOUT_MS = 5 * 60 * 1000

function routeFeature(route) {
  return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: route.map(([lat, lng]) => [lng, lat]) } }
}

function stopFeatures(places) {
  return {
    type: 'FeatureCollection',
    features: places.map((place, index) => ({
      type: 'Feature',
      properties: { name: place.name, endpoint: index === 0 || index === places.length - 1 },
      geometry: { type: 'Point', coordinates: [place.point[1], place.point[0]] },
    })),
  }
}

function markerContent(point) {
  const root = document.createElement('div')
  root.className = 'cityshare-live-bus'
  root.innerHTML = '<span class="cityshare-live-bus__pulse"></span><span class="cityshare-live-bus__icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17V5.8A2.8 2.8 0 0 1 7.8 3h8.4A2.8 2.8 0 0 1 19 5.8V17M5 11h14M7.5 17v2m9-2v2M7.5 7.5h9M8 20h.01M16 20h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'

  const details = document.createElement('div')
  details.className = 'cityshare-live-bus-popup'
  const bus = document.createElement('strong')
  bus.textContent = point.voyage?.bus?.immatriculation || point.voyage?.bus?.numeroBus || point.idBalise || 'Bus suivi'
  const trip = document.createElement('span')
  trip.textContent = point.voyage?.codeVoyage ? `Voyage ${point.voyage.codeVoyage}` : 'Position GPS reçue'
  const speed = document.createElement('span')
  speed.textContent = `Vitesse : ${point.vitesseKmh ?? '—'} km/h`
  details.append(bus, trip, speed)

  return { element: root, popup: new Popup({ offset: 20, closeButton: false }).setDOMContent(details) }
}

function syncBuses(map, markers, positions) {
  const active = new Set()
  const now = Date.now()
  positions.forEach((point) => {
    const latitude = Number(point.latitude)
    const longitude = Number(point.longitude)
    const timestamp = parseCmInstant(point.dateHeureReleve)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(timestamp) || now - timestamp < 0 || now - timestamp > BUS_TIMEOUT_MS) return

    const id = String(point.idBalise || point.idPosition)
    active.add(id)
    const current = markers.get(id)
    if (current) current.setLngLat([longitude, latitude])
    else {
      const { element, popup } = markerContent(point)
      markers.set(id, new Marker({ element, anchor: 'center' }).setLngLat([longitude, latitude]).setPopup(popup).addTo(map))
    }
  })
  markers.forEach((marker, id) => {
    if (!active.has(id)) { marker.remove(); markers.delete(id) }
  })
}

export default function CityShareRouteMap({ route, places, livePositions = [] }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const busMarkersRef = useRef(new Map())
  const dataRef = useRef({ route, places, livePositions })
  const framedRef = useRef(false)
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  dataRef.current = { route, places, livePositions }

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setDark(root.dataset.theme === 'dark'))
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current) return undefined
    const map = new MapLibreMap({
      container: containerRef.current,
      style: dark ? styleNight : styleDay,
      center: [10.65, 3.9],
      zoom: 6.8,
      minZoom: 5,
      maxZoom: 18,
      scrollZoom: false,
      attributionControl: { compact: true, customAttribution: '© OpenStreetMap contributors · OpenMapTiles · OpenFreeMap' },
    })
    mapRef.current = map
    const busMarkers = busMarkersRef.current
    map.addControl(new NavigationControl({ showCompass: false, visualizePitch: false }), 'top-right')

    const drawRoute = () => {
      if (!map.isStyleLoaded()) return
      const { route: currentRoute, places: currentPlaces, livePositions: currentPositions } = dataRef.current
      if (!map.getSource('god-travel-route')) map.addSource('god-travel-route', { type: 'geojson', data: routeFeature(currentRoute) })
      else map.getSource('god-travel-route').setData(routeFeature(currentRoute))
      if (!map.getLayer('god-travel-route-casing')) map.addLayer({ id: 'god-travel-route-casing', type: 'line', source: 'god-travel-route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 10, 'line-opacity': 0.94 } })
      if (!map.getLayer('god-travel-route-line')) map.addLayer({ id: 'god-travel-route-line', type: 'line', source: 'god-travel-route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#14b2b6', 'line-width': 5, 'line-opacity': 0.98 } })

      if (!map.getSource('god-travel-stops')) map.addSource('god-travel-stops', { type: 'geojson', data: stopFeatures(currentPlaces) })
      else map.getSource('god-travel-stops').setData(stopFeatures(currentPlaces))
      if (!map.getLayer('god-travel-stop-halo')) map.addLayer({ id: 'god-travel-stop-halo', type: 'circle', source: 'god-travel-stops', paint: { 'circle-radius': ['case', ['get', 'endpoint'], 10, 7], 'circle-color': '#ffffff', 'circle-opacity': 0.96 } })
      if (!map.getLayer('god-travel-stop-dot')) map.addLayer({ id: 'god-travel-stop-dot', type: 'circle', source: 'god-travel-stops', paint: { 'circle-radius': ['case', ['get', 'endpoint'], 6, 4], 'circle-color': ['case', ['get', 'endpoint'], '#14b2b6', '#f78b03'] } })
      if (!map.getLayer('god-travel-stop-label')) map.addLayer({ id: 'god-travel-stop-label', type: 'symbol', source: 'god-travel-stops', layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 11, 'text-offset': [0, 1.35], 'text-anchor': 'top', 'text-allow-overlap': false }, paint: { 'text-color': '#17363a', 'text-halo-color': '#ffffff', 'text-halo-width': 1.5 } })

      syncBuses(map, busMarkers, currentPositions)
      if (!framedRef.current && currentRoute.length > 1) {
        const bounds = new LngLatBounds()
        currentRoute.forEach(([lat, lng]) => bounds.extend([lng, lat]))
        map.fitBounds(bounds, { padding: { top: 54, right: 70, bottom: 75, left: 70 }, duration: 0, maxZoom: 8 })
        framedRef.current = true
      }
    }

    map.on('style.load', drawRoute)
    const observer = new ResizeObserver(() => map.resize())
    observer.observe(containerRef.current)
    return () => {
      observer.disconnect()
      busMarkers.forEach((marker) => marker.remove())
      busMarkers.clear()
      map.remove()
      mapRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current
    if (map && map.isStyleLoaded()) syncBuses(map, busMarkersRef.current, livePositions)
  }, [livePositions])

  useEffect(() => {
    const map = mapRef.current
    const nextStyle = dark ? styleNight : styleDay
    if (map && map.getStyle()?.name !== nextStyle.name) map.setStyle(nextStyle)
  }, [dark])

  const recenter = () => {
    const map = mapRef.current
    if (!map || route.length < 2) return
    const bounds = new LngLatBounds()
    route.forEach(([lat, lng]) => bounds.extend([lng, lat]))
    map.fitBounds(bounds, { padding: { top: 54, right: 70, bottom: 75, left: 70 }, duration: 700, maxZoom: 8 })
  }

  return <div className="cityshare-route-map-shell">
    <div ref={containerRef} className="landing-map cityshare-route-map" role="region" aria-label="Carte interactive de l’itinéraire Yaoundé–Douala" />
    <button type="button" className="cityshare-route-recenter" onClick={recenter} title="Recentrer sur l’itinéraire" aria-label="Recentrer sur l’itinéraire"><LocateFixed size={17} /></button>
  </div>
}
