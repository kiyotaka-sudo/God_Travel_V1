import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BusFront, Ticket, Package, Wallet, MapPin, Navigation, 
  ArrowRight, ShieldCheck, Zap, Clock, CheckCircle2, ChevronRight,
  Radio, Phone, Smartphone, Award, Sparkles, Gauge
} from 'lucide-react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import BusBanner from '@components/bus/BusBanner'
import { useAuthStore } from '@store/authStore'

// Tracé réel Nationale 3
const routeN3 = [
  [3.8480, 11.5021], // Yaoundé (Mvan)
  [3.7800, 11.3800], // Mbankomo
  [3.7500, 11.1500], // Matomb
  [3.8500, 11.0200], // Boumnyébel
  [3.8000, 10.1300], // Édéa (Pont Sanaga)
  [3.9800, 9.9200],  // Pouma / Dibamba
  [4.0510, 9.7679],  // Douala (Bépanda)
]

export default function LandingPage() {
  const { token, user } = useAuthStore()
  const navigate = useNavigate()

  const [depart, setDepart] = useState('Yaoundé (Mvan)')
  const [arrivee, setArrivee] = useState('Douala (Bépanda)')
  const [classe, setClasse] = useState('VIP')
  const [turboMode, setTurboMode] = useState(true)

  const tarifAffiche = classe === 'VIP' ? '6 000' : '4 000'

  const handleReserverDirect = (e) => {
    e.preventDefault()
    // Redirige vers la billetterie ou connexion
    navigate(token ? '/app/billetterie' : '/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* ========================================================
          1. BANNIÈRE PERMANENTE DU BUS QUI ROULE À FOND (TOP TICKER)
         ======================================================== */}
      <BusBanner />

      {/* ========================================================
          2. NAVIGATION PRINCIPALE LUXE & ENTREPRISE
         ======================================================== */}
      <header className="h-20 px-4 sm:px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 transition transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-black text-amber-400 text-lg tracking-wider">GT</span>
            </div>
          </div>
          <div>
            <h1 className="font-black text-lg text-white tracking-wide group-hover:text-amber-400 transition flex items-center gap-2">
              GOD TRAVEL
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                OFFICIEL
              </span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">United Express · Cameroun</p>
          </div>
        </Link>

        {/* Liens Centraux */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
          <a href="#horaires" className="hover:text-amber-400 transition">Départs & Horaires</a>
          <a href="#tarifs" className="hover:text-amber-400 transition">Classes VIP & Standard</a>
          <a href="#carte" className="hover:text-amber-400 transition">Corridor Nationale 3</a>
          <a href="#colis" className="hover:text-amber-400 transition">Fret Express</a>
        </nav>

        {/* Boutons d'Accès Rapides */}
        <div className="flex items-center gap-3">
          <Link
            to={token ? "/app" : "/login"}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] transition transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Zap size={14} className="fill-current" />
            <span>{token ? "Accéder à l'Espace Travail" : "Accès Équipe / Guichet"}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ========================================================
          3. HERO SECTION SPECTACULAIRE — LE BUS QUI ROULE À FOND
         ======================================================== */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 sm:px-8 border-b border-slate-800">
        
        {/* Halos lumineux de fond */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-500/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          
          {/* Titre et Accroche */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles size={14} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Ligne Pilote Interurbaine · 240 KM d'Axe Lourd Sécurisé</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              La Route Yaoundé ⇄ Douala,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">
                À Pleine Vitesse & Zéro Tracas.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Voyagez à bord de nos autocars VIP Marcopolo & Yutong grand confort. Départs garantis toutes les 30 minutes, géolocalisation radar par satellite, paiement Mobile Money Monetbil et traçabilité fret complète.
            </p>
          </div>

          {/* ========================================================
              LA GRANDE SCÈNE CENTRALE : L'AUTOCAR VIP EN PLEIN RÉGIME
             ======================================================== */}
          <div className="relative w-full max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
            
            {/* Tête de contrôle de la scène */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>TRANSMISSION RADAR LIVE</span>
                    <span className="text-amber-400 font-mono">· VOY-YDE-DLA-07H30</span>
                  </p>
                  <p className="text-[11px] text-slate-400">Position : Traversée du Pont sur la Sanaga (Édéa)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right font-mono">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Régime Moteur</span>
                  <p className="text-sm font-black text-amber-400">
                    {turboMode ? '110 KM/H (TURBO)' : '85 KM/H (CROISIÈRE)'}
                  </p>
                </div>

                <button
                  onClick={() => setTurboMode(!turboMode)}
                  className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                    turboMode 
                      ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                      : 'bg-slate-800 text-amber-400 border border-slate-700'
                  }`}
                >
                  <Gauge size={14} className={turboMode ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
                  <span>{turboMode ? 'PLEIN RÉGIME' : 'ÉCO'}</span>
                </button>
              </div>
            </div>

            {/* Piste d'autoroute avec le bus ultra-rapide */}
            <div className="relative h-44 sm:h-52 my-4 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden border border-slate-800/80 shadow-inner flex flex-col justify-end pb-8">
              
              {/* Ligne d'horizon avec montagnes et lampions au loin */}
              <div className="absolute top-3 left-0 right-0 h-10 border-b border-slate-800/40 opacity-40">
                <div className="flex justify-between px-10 text-[9px] font-mono text-slate-600">
                  <span>YAOUNDÉ (KM 0)</span>
                  <span>MBANKOMO (KM 25)</span>
                  <span>BOUMNYÉBEL (KM 88)</span>
                  <span>ÉDÉA (KM 170)</span>
                  <span>DOUALA (KM 240)</span>
                </div>
              </div>

              {/* Chaussée & Bandes de route défilant à toute vitesse */}
              <div className="relative w-full h-16 bg-slate-900 border-t-2 border-slate-700/80">
                {/* Ligne discontinue blanche / jaune rapide */}
                <div 
                  className="absolute top-6 left-0 right-0 h-1"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, #FCD34D 0, #FCD34D 35px, transparent 35px, transparent 65px)',
                    animation: turboMode ? 'highwayFast 0.18s linear infinite' : 'highwayFast 0.38s linear infinite',
                  }}
                />
                <div 
                  className="absolute bottom-2 left-0 right-0 h-[2px]"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(90deg, #FFFFFF 0, #FFFFFF 20px, transparent 20px, transparent 40px)',
                    animation: turboMode ? 'highwayFast 0.2s linear infinite' : 'highwayFast 0.42s linear infinite',
                  }}
                />
              </div>

              {/* GRAND AUTOCAR VIP MARCOPOLO QUI ROULE EN PERMANENCE */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 bottom-8 z-20 flex items-center"
                style={{
                  animation: 'busSuspension 0.6s ease-in-out infinite alternate',
                }}
              >
                {/* Faisceau lumineux des phares avant ultra-puissant vers la droite */}
                <div 
                  className="absolute top-7 -right-48 w-56 h-16 pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(90deg, rgba(254, 240, 138, 0.6) 0%, rgba(254, 240, 138, 0) 100%)',
                    clipPath: 'polygon(0% 35%, 100% 0%, 100% 100%, 0% 65%)',
                    filter: 'blur(3px)',
                  }}
                />

                {/* Traînées de vitesse cyan et or vers la gauche */}
                <div className="absolute top-4 -left-36 w-40 h-10 flex flex-col justify-around opacity-80 pointer-events-none">
                  <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent w-full" style={{ animation: 'speedStreak 0.25s linear infinite' }} />
                  <div className="h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent w-3/4 ml-8" style={{ animation: 'speedStreak 0.18s linear infinite' }} />
                  <div className="h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-5/6 ml-4" style={{ animation: 'speedStreak 0.22s linear infinite' }} />
                </div>

                {/* Corps de l'autocar grand format */}
                <div className="relative w-72 sm:w-80 h-16 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 rounded-r-2xl rounded-l-lg border-2 border-amber-400/60 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between p-2">
                  
                  {/* Toit & Bandeau girouette lumineuse */}
                  <div className="flex items-center justify-between px-2 bg-slate-950/80 rounded-md py-0.5 border border-amber-400/30">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span className="text-[9px] font-black uppercase text-amber-300 font-mono tracking-wider">
                        YAOUNDÉ ➔ DOUALA · VIP EXPRESS
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-black text-emerald-400">
                      {turboMode ? '110 km/h' : '85 km/h'}
                    </span>
                  </div>

                  {/* Rangée de vitres panoramiques teintées avec reflets */}
                  <div className="flex gap-1.5 px-2 my-1">
                    {Array.from({ length: 9 }).map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-4 flex-1 rounded-sm border border-slate-700/80 ${
                          idx === 8 ? 'bg-cyan-300/40 rounded-r-lg' : 'bg-slate-950/90'
                        } relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                      </div>
                    ))}
                  </div>

                  {/* Bas de caisse / Logo United Express */}
                  <div className="flex items-center justify-between px-2">
                    <span className="text-[8px] font-black tracking-widest text-amber-400">
                      UNITED EXPRESS S.A.
                    </span>
                    <div className="flex items-center gap-1">
                      {/* Phares avant dorés très éclatants */}
                      <div className="w-3.5 h-2 rounded-r-full bg-amber-200 shadow-[0_0_15px_#FDE047]" />
                    </div>
                  </div>

                  {/* Roues doubles essieux avec jantes chromées animées */}
                  <div className="absolute -bottom-2.5 left-7 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-600 flex items-center justify-center shadow-lg">
                    <div 
                      className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-amber-400"
                      style={{ animation: turboMode ? 'wheelSpin 0.12s linear infinite' : 'wheelSpin 0.25s linear infinite' }}
                    />
                  </div>
                  <div className="absolute -bottom-2.5 left-16 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-600 flex items-center justify-center shadow-lg">
                    <div 
                      className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-amber-400"
                      style={{ animation: turboMode ? 'wheelSpin 0.12s linear infinite' : 'wheelSpin 0.25s linear infinite' }}
                    />
                  </div>
                  <div className="absolute -bottom-2.5 right-8 w-6 h-6 rounded-full bg-slate-950 border-2 border-slate-600 flex items-center justify-center shadow-lg">
                    <div 
                      className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-amber-400"
                      style={{ animation: turboMode ? 'wheelSpin 0.12s linear infinite' : 'wheelSpin 0.25s linear infinite' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pied du stage avec badges de sécurité */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400 gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Véhicule certifié CEMAC · Visite technique valide 2026</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-amber-400">
                <Radio size={14} className="animate-pulse" />
                <span>Balise GPS IMEI : 864201048291039 (Actif)</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              WIDGET DE RÉSERVATION DIRECTE SUR LA PAGE D'ACCUEIL
             ======================================================== */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl max-w-4xl mx-auto backdrop-blur-xl">
            <h2 className="text-sm font-mono font-black uppercase text-amber-400 tracking-wider mb-4 flex items-center gap-2">
              <Ticket size={18} />
              <span>Simulateur & Réservation Express de Voyage</span>
            </h2>

            <form onSubmit={handleReserverDirect} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Gare de Départ</label>
                <select
                  value={depart}
                  onChange={(e) => setDepart(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs outline-none focus:border-amber-400"
                >
                  <option value="Yaoundé (Mvan)">Yaoundé (Gare Mvan)</option>
                  <option value="Douala (Bépanda)">Douala (Gare Bépanda)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Gare d'Arrivée</label>
                <select
                  value={arrivee}
                  onChange={(e) => setArrivee(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs outline-none focus:border-amber-400"
                >
                  <option value="Douala (Bépanda)">Douala (Gare Bépanda)</option>
                  <option value="Yaoundé (Mvan)">Yaoundé (Gare Mvan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Classe de Voyage</label>
                <select
                  value={classe}
                  onChange={(e) => setClasse(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold text-xs outline-none focus:border-amber-400"
                >
                  <option value="VIP">VIP Climatisé (6 000 FCFA)</option>
                  <option value="Standard">Standard Confort (4 000 FCFA)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.4)] transition transform hover:-translate-y-0.5"
                >
                  <span>Réserver ({tarifAffiche} F)</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. ACCÈS DIRECT AUX 4 PILIERS OPÉRATIONNELS
         ======================================================== */}
      <section className="py-14 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Plateforme Complète d'Exploitation God Travel
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Chaque métier dispose de son interface dédiée, connectée en direct à la base MySQL 43 tables et à l'API Spring Boot.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link
            to={token ? "/app/billetterie" : "/login"}
            className="group p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-900 transition flex flex-col justify-between shadow-xl hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                <Ticket size={24} />
              </div>
              <h3 className="font-black text-base text-white group-hover:text-amber-400 transition">
                Guichet & Billetterie
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Plan de bus 2D, choix du fauteuil, encaissement Monetbil / Cash et impression thermique avec QR code.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Ouvrir Guichet</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to={token ? "/app/colis" : "/login"}
            className="group p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-400/50 hover:bg-slate-900 transition flex flex-col justify-between shadow-xl hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
                <Package size={24} />
              </div>
              <h3 className="font-black text-base text-white group-hover:text-emerald-400 transition">
                Fret & Expédition Colis
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pesée automatique au kilo (500 F/kg), code de suivi unique et traçabilité inter-agences.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Ouvrir Fret</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to={token ? "/app/gps" : "/login"}
            className="group p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-400/50 hover:bg-slate-900 transition flex flex-col justify-between shadow-xl hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition">
                <Navigation size={24} />
              </div>
              <h3 className="font-black text-base text-white group-hover:text-cyan-400 transition">
                Tour de Contrôle GPS
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Carte Leaflet interactive du corridor N3, radars de vitesse et alertes automatiques &gt; 100 km/h.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-cyan-400">
              <span>Voir la Carte</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <Link
            to={token ? "/app/caisse" : "/login"}
            className="group p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-purple-400/50 hover:bg-slate-900 transition flex flex-col justify-between shadow-xl hover:-translate-y-1"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-400/10 border border-purple-400/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
                <Wallet size={24} />
              </div>
              <h3 className="font-black text-base text-white group-hover:text-purple-400 transition">
                Caisse & Rapprochement
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suivi du fond de roulement, distinction des flux espèces / Mobile Money et clôture journalière.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-purple-400">
              <span>Gérer Caisse</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* ========================================================
          5. CARTE INTERACTIVE LEAFLET DU CORRIDOR N3
         ======================================================== */}
      <section id="carte" className="py-12 px-4 sm:px-8 border-t border-slate-800 bg-slate-950/60">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs font-mono font-black uppercase text-amber-400 tracking-wider">
                Cartographie Interactive OpenStreetMap
              </span>
              <h2 className="text-xl font-black text-white mt-1">
                L'Itinéraire Pilote : Nationale 3 (240 km)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Gares desservies : Mvan (Yaoundé) · Bépanda (Douala) · Halte Édéa
            </span>
          </div>

          <div className="h-[420px] w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <MapContainer
              center={[3.88, 10.65]}
              zoom={8}
              scrollWheelZoom={false}
              className="h-full w-full z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Polyline
                positions={routeN3}
                color="#06b6d4"
                weight={5}
                opacity={0.85}
                dashArray="8, 10"
              />

              <CircleMarker center={routeN3[0]} radius={8} pathOptions={{ color: '#F59E0B', fillColor: '#0F172A', fillOpacity: 1, weight: 3 }}>
                <Tooltip permanent direction="top" offset={[0, -10]}>Gare Mvan (Yaoundé)</Tooltip>
              </CircleMarker>

              <CircleMarker center={routeN3[4]} radius={6} pathOptions={{ color: '#10B981', fillColor: '#0F172A', fillOpacity: 1, weight: 2 }}>
                <Tooltip permanent direction="top" offset={[0, -8]}>Édéa (Pont Sanaga)</Tooltip>
              </CircleMarker>

              <CircleMarker center={routeN3[6]} radius={8} pathOptions={{ color: '#F59E0B', fillColor: '#0F172A', fillOpacity: 1, weight: 3 }}>
                <Tooltip permanent direction="top" offset={[0, -10]}>Gare Bépanda (Douala)</Tooltip>
              </CircleMarker>
            </MapContainer>

            <div className="absolute bottom-4 left-4 z-[400] px-3.5 py-2 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Tracé GPS Actif · 240 km surveillés par balise GSM</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FOOTER PROFESSIONNEL
         ======================================================== */}
      <footer className="mt-auto border-t border-slate-800 py-8 px-4 sm:px-8 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-white text-sm">GOD TRAVEL</span>
            <span className="text-slate-600">|</span>
            <span>United Express S.A. Cameroun</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-mono">XAMPP Port 3307</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Base 43 Tables MySQL</span>
            <span>·</span>
            <span>Spring Boot 3</span>
            <span>·</span>
            <span>React Vite</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
