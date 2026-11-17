import React, { useState } from 'react'
import { Zap, ShieldCheck, Navigation, Radio, Gauge, MapPin } from 'lucide-react'

export default function BusBanner({ compact = false }) {
  const [turbo, setTurbo] = useState(true)

  return (
    <div className={`relative overflow-hidden w-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-y border-amber-500/30 shadow-2xl ${
      compact ? 'py-2' : 'py-3'
    }`}>
      {/* Ciel nocturne / Horizon & Effet vitesse */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Ligne d'étoiles / lampions défilants au loin */}
      <div className="absolute top-1 left-0 right-0 h-4 opacity-30 overflow-hidden pointer-events-none">
        <div className="flex gap-16 animate-pulse">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1 h-1 bg-amber-300 rounded-full" />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-3 relative z-10">
        
        {/* En-tête / Badge Télématique */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-2 h-2 -ml-3 rounded-full bg-emerald-400" />
            <span>FLOTTE EN DIRECT</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-white">Nationale 3</span> : Yaoundé Mvan ⇄ Douala Bépanda (240 km)
          </div>
        </div>

        {/* ========================================================
            LE BUS QUI ROULE À FOND EN PERMANENCE SUR L'ASPHALTE
           ======================================================== */}
        <div className="flex-1 w-full max-w-xl mx-auto relative h-14 overflow-hidden rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-inner">
          
          {/* Chaussée / Asphalt Road */}
          <div className="absolute inset-0 top-6 bg-slate-900 border-t border-slate-700/60">
            {/* Ligne blanche centrale en défilement ultra-rapide */}
            <div 
              className="absolute top-3 left-0 right-0 h-[2px]"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #FCD34D 0, #FCD34D 28px, transparent 28px, transparent 48px)',
                animation: turbo ? 'highwayFast 0.22s linear infinite' : 'highwayFast 0.45s linear infinite',
              }}
            />
            {/* Marquage bord de route défilant */}
            <div 
              className="absolute bottom-1 left-0 right-0 h-[1px]"
              style={{
                backgroundImage: 'repeating-linear-gradient(90deg, #FFFFFF 0, #FFFFFF 15px, transparent 15px, transparent 30px)',
                animation: turbo ? 'highwayFast 0.25s linear infinite' : 'highwayFast 0.5s linear infinite',
              }}
            />
          </div>

          {/* Autocar VIP Stylisé en mouvement continu avec phares allumés */}
          <div 
            className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center"
            style={{
              animation: 'busSuspension 0.8s ease-in-out infinite alternate',
            }}
          >
            {/* Véhicule Bus SVG Luxury VIP */}
            <div className="relative">
              
              {/* Faisceau lumineux des phares avant (projette vers la droite) */}
              <div 
                className="absolute top-4 -right-28 w-32 h-6 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, rgba(254, 240, 138, 0.45) 0%, rgba(254, 240, 138, 0) 100%)',
                  clipPath: 'polygon(0% 40%, 100% 0%, 100% 100%, 0% 70%)',
                  filter: 'blur(2px)',
                }}
              />

              {/* Traînée aérodynamique / Vent de vitesse (derrière le bus, vers la gauche) */}
              <div className="absolute top-2 -left-20 w-24 h-4 flex flex-col justify-between opacity-70 pointer-events-none">
                <div 
                  className="h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" 
                  style={{ animation: 'speedStreak 0.3s linear infinite' }} 
                />
                <div 
                  className="h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent w-16 ml-6" 
                  style={{ animation: 'speedStreak 0.2s linear infinite' }} 
                />
                <div 
                  className="h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent w-20 ml-2" 
                  style={{ animation: 'speedStreak 0.25s linear infinite' }} 
                />
              </div>

              {/* Corps principal de l'autocar */}
              <div className="relative w-44 h-8 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 rounded-r-xl rounded-l-md border border-amber-400/40 shadow-xl flex flex-col justify-between p-1">
                
                {/* Bandeau de destination lumineux sur le pare-brise */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[7px] font-black uppercase text-amber-300 tracking-tighter truncate">
                      YAOUNDÉ ➔ DOUALA · VIP
                    </span>
                  </div>
                  <span className="text-[7px] font-mono font-black text-emerald-400">
                    {turbo ? '110 km/h' : '88 km/h'}
                  </span>
                </div>

                {/* Vitres passagers teintées avec reflets */}
                <div className="flex gap-1 px-1">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`h-2.5 flex-1 rounded-sm border border-slate-700/80 ${
                        idx === 7 ? 'bg-cyan-200/50 rounded-r-md' : 'bg-slate-900/90'
                      } relative overflow-hidden`}
                    >
                      {/* Reflet de vitre */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                    </div>
                  ))}
                </div>

                {/* Bas de caisse / Logo God Travel United */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-[6px] font-black text-amber-400 tracking-widest">
                    UNITED EXPRESS
                  </span>
                  <div className="flex items-center gap-0.5">
                    {/* Phares avant jaunes éclatants */}
                    <div className="w-2 h-1.5 rounded-r-full bg-amber-200 shadow-[0_0_8px_#FDE047]" />
                  </div>
                </div>

                {/* Roues en rotation rapide */}
                <div className="absolute -bottom-1.5 left-5 w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center shadow-md">
                  <div 
                    className="w-2 h-2 rounded-full border border-dashed border-amber-400"
                    style={{ animation: turbo ? 'wheelSpin 0.15s linear infinite' : 'wheelSpin 0.3s linear infinite' }}
                  />
                </div>
                <div className="absolute -bottom-1.5 left-11 w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center shadow-md">
                  <div 
                    className="w-2 h-2 rounded-full border border-dashed border-amber-400"
                    style={{ animation: turbo ? 'wheelSpin 0.15s linear infinite' : 'wheelSpin 0.3s linear infinite' }}
                  />
                </div>
                <div className="absolute -bottom-1.5 right-6 w-4 h-4 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center shadow-md">
                  <div 
                    className="w-2 h-2 rounded-full border border-dashed border-amber-400"
                    style={{ animation: turbo ? 'wheelSpin 0.15s linear infinite' : 'wheelSpin 0.3s linear infinite' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compteur & Contrôles Rapides */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Gauge className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="text-left leading-tight">
              <p className="text-[9px] uppercase font-bold text-slate-400">Régime Moteur</p>
              <p className="text-xs font-black text-amber-400 font-mono">
                {turbo ? '110 KM/H (TURBO)' : '90 KM/H (ÉCO)'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setTurbo(!turbo)}
            title="Basculer la vitesse d'animation"
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-lg ${
              turbo 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500' 
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${turbo ? 'fill-current animate-bounce' : ''}`} />
            <span>{turbo ? 'À FOND' : 'ÉCO'}</span>
          </button>
        </div>
      </div>

      {/* Styles d'animation personnalisés */}
      <style>{`
        @keyframes highwayFast {
          from { background-position: 0 0; }
          to { background-position: -48px 0; }
        }
        @keyframes busSuspension {
          0% { transform: translate(-50%, 0px); }
          50% { transform: translate(-50%, -1.5px); }
          100% { transform: translate(-50%, 0.5px); }
        }
        @keyframes wheelSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes speedStreak {
          0% { opacity: 0; transform: translateX(20px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-40px); }
        }
      `}</style>
    </div>
  )
}

