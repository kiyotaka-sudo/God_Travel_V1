import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { gpsApi } from '@api/index'
import { MapPin, Navigation, AlertTriangle, ShieldCheck, RefreshCw, Bus, Clock, Gauge, Radio, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

// Correction des icônes par défaut de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Tracé de la Nationale 3 (Yaoundé Mvan ⇄ Douala Bépanda)
const traceN3YaoundeDouala = [
  [3.8480, 11.5021], // Yaoundé (Mvan)
  [3.7800, 11.3800], // Mbankomo
  [3.7500, 11.1500], // Matomb
  [3.8500, 11.0200], // Boumnyébel
  [3.8000, 10.1300], // Édéa (Pont sur la Sanaga)
  [3.9800, 9.9200],  // Pouma / Dibamba
  [4.0510, 9.7679],  // Douala (Bépanda)
]

const createBusIcon = (vitesse = 0, isSelected = false) => {
  const isOverSpeed = vitesse > 100

  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div style="
          padding: 4px 8px;
          border-radius: 9999px;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 4px;
          color: ${isOverSpeed ? '#ffffff' : '#0f172a'};
          background: ${isOverSpeed ? '#ef4444' : isSelected ? '#fbbf24' : '#10b981'};
          box-shadow: 0 0 ${isSelected ? '20px rgba(251,191,36,0.8)' : '10px rgba(0,0,0,0.5)'};
          border: 2px solid #ffffff;
        ">
          <span>🚌</span>
          <span>${vitesse} km/h</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 6px solid ${isOverSpeed ? '#ef4444' : isSelected ? '#fbbf24' : '#10b981'};
        "></div>
      </div>
    `,
    iconSize: [85, 34],
    iconAnchor: [42, 34],
  })
}

export default function GpsPage() {
  const [loading, setLoading] = useState(false)
  const [positions, setPositions] = useState([])
  const [alertes, setAlertes] = useState([])
  const [selectedBus, setSelectedBus] = useState(null)

  const defaultPositions = [
    {
      id: 'POS-001',
      busImmat: 'LT-542-AA (Yutong VIP)',
      ligne: 'Yaoundé Mvan ➔ Douala Bépanda',
      chauffeur: 'MBALLA Eric',
      latitude: 3.8200,
      longitude: 10.5500,
      vitesseKmh: 92,
      dateReleve: 'Il y a 1 min',
      statut: 'EN_ROUTE',
    },
    {
      id: 'POS-002',
      busImmat: 'CE-892-BC (Toyota Coaster)',
      ligne: 'Douala Bépanda ➔ Yaoundé Mvan',
      chauffeur: 'TCHOUA Marc',
      latitude: 3.8500,
      longitude: 11.0200, // Boumnyébel
      vitesseKmh: 108, // Survitesse
      dateReleve: 'Il y a 30 sec',
      statut: 'SURVITESSE',
    },
    {
      id: 'POS-003',
      busImmat: 'LT-441-AA (Marcopolo VIP)',
      ligne: 'Yaoundé Mvan ➔ Douala Bépanda',
      chauffeur: 'KAMDEM Roger',
      latitude: 3.8480,
      longitude: 11.5021, // Mvan
      vitesseKmh: 0,
      dateReleve: 'À quai',
      statut: 'A_L_ARRET',
    },
  ]

  const chargerDonneesGps = async () => {
    setLoading(true)
    try {
      const res = await gpsApi.getPositions().catch(() => null)
      if (res?.data?.data && res.data.data.length > 0) {
        setPositions(res.data.data)
      } else {
        setPositions(defaultPositions)
      }

      setAlertes([
        {
          id: 'ALT-01',
          type: 'EXCES_VITESSE',
          bus: 'CE-892-BC',
          message: 'Vitesse de 108 km/h détectée sur la Nationale 3 (Boumnyébel). Déclencheur SQL TRG_ALERTE_SURVITESSE_GPS activé.',
          heure: '12:45',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerDonneesGps()
    const timer = setInterval(chargerDonneesGps, 12000)
    return () => clearInterval(timer)
  }, [])

  const currentBus = selectedBus || positions[0] || defaultPositions[0]

  return (
    <div className="space-y-6">
      
      {/* En-tête Command Center */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Radio size={20} className="animate-pulse" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Tour de Contrôle Flotte & Télématique GPS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Corridor pilote <strong className="text-white">Nationale 3 (240 km)</strong> · Balises GSM/GPS actives et radar de vitesse régulé à 100 km/h
          </p>
        </div>

        <button
          onClick={chargerDonneesGps}
          disabled={loading}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2 transition"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Rafraîchir Signal GPS</span>
        </button>
      </div>

      {/* Alerte Survitesse */}
      {alertes.length > 0 && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs">
          <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <p className="font-black text-red-300 uppercase tracking-wide">
              Alerte Sécurité Routière · Excès de Vitesse ({alertes[0].bus})
            </p>
            <p className="text-red-200/90 mt-0.5">{alertes[0].message}</p>
          </div>
          <span className="text-[11px] font-mono text-red-400 font-bold">{alertes[0].heure}</span>
        </div>
      )}

      {/* Cartes et Panneau Flotte */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CARTE LEAFLET (8/12) */}
        <div className="lg:col-span-8 p-3 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="h-[520px] w-full rounded-2xl overflow-hidden relative">
            <MapContainer
              center={[3.88, 10.65]}
              zoom={8}
              scrollWheelZoom={true}
              className="h-full w-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Ligne Nationale 3 tracée */}
              <Polyline
                positions={traceN3YaoundeDouala}
                color="#06b6d4"
                weight={5}
                opacity={0.8}
                dashArray="8, 10"
              />

              {/* Positions des bus */}
              {positions.map((b) => (
                <Marker
                  key={b.id}
                  position={[b.latitude, b.longitude]}
                  icon={createBusIcon(b.vitesseKmh, selectedBus?.id === b.id)}
                  eventHandlers={{
                    click: () => setSelectedBus(b),
                  }}
                >
                  <Popup>
                    <div className="p-1 text-slate-950 font-sans">
                      <p className="font-black text-xs">{b.busImmat}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{b.ligne}</p>
                      <p className="text-xs font-bold text-emerald-600 mt-1">Vitesse : {b.vitesseKmh} km/h</p>
                      <p className="text-[10px] text-slate-500">Chauffeur : {b.chauffeur}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Légende flottante sur la carte */}
            <div className="absolute bottom-4 left-4 z-[400] p-3 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Vitesse Normale (&lt; 100 km/h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400 font-bold">Survitesse (&gt; 100 km/h)</span>
              </div>
            </div>
          </div>
        </div>

        {/* PANNEAU FLOTTE & TÉLÉMÉTRIE DU BUS SÉLECTIONNÉ (4/12) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Télémétrie en temps réel */}
          {currentBus && (
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider">
                  Télémétrie Véhicule
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentBus.vitesseKmh > 100 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {currentBus.vitesseKmh > 100 ? 'SURVITESSE' : 'EN ROUTE'}
                </span>
              </div>

              <div>
                <p className="text-base font-black text-white">{currentBus.busImmat}</p>
                <p className="text-xs text-slate-400 mt-0.5">{currentBus.ligne}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Vitesse Instantanée</p>
                  <p className={`text-3xl font-black font-mono mt-0.5 ${
                    currentBus.vitesseKmh > 100 ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {currentBus.vitesseKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                  <Gauge size={26} className={currentBus.vitesseKmh > 0 ? 'animate-spin' : ''} style={{ animationDuration: '4s' }} />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Conducteur :</span>
                  <span className="font-bold text-white">{currentBus.chauffeur}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dernier Pointage :</span>
                  <span className="font-mono text-slate-300">{currentBus.dateReleve}</span>
                </div>
                <div className="flex justify-between">
                  <span>Statut Balise :</span>
                  <span className="text-emerald-400 font-bold">Signal 4G Fort (100%)</span>
                </div>
              </div>
            </div>
          )}

          {/* Liste des bus surveillés */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider">
              Flotte en Déplacement ({positions.length})
            </h3>

            <div className="space-y-2">
              {positions.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBus(b)}
                  className={`w-full p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    selectedBus?.id === b.id
                      ? 'bg-amber-400/10 border-amber-400 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <p className="font-black text-xs text-white">{b.busImmat.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400">{b.chauffeur}</p>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    b.vitesseKmh > 100 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-amber-400'
                  }`}>
                    {b.vitesseKmh} km/h
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
