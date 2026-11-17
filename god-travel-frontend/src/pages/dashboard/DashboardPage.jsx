import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Bus, Ticket, Package, Wallet, MapPin, Wrench, Shield, 
  TrendingUp, Users, CheckCircle2, ArrowRight, Zap, 
  Clock, AlertTriangle, Radio, Navigation, ChevronRight, Activity
} from 'lucide-react'
import { useAuthStore } from '@store/authStore'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const stats = [
    { label: 'Départs Programmés Aujourd\'hui', val: '14', detail: '8 VIP · 6 Standard', icon: Bus, color: 'from-blue-600 to-indigo-600', badge: '+2 ajoutés' },
    { label: 'Billets Émis (Yaoundé ⇄ Douala)', val: '438', detail: 'Taux de remplissage : 89%', icon: Ticket, color: 'from-amber-500 to-yellow-500', badge: '89% plein' },
    { label: 'Colis & Fret en Transit', val: '67', detail: '1,420 kg transportés', icon: Package, color: 'from-emerald-600 to-teal-600', badge: 'Fluide' },
    { label: 'Recettes Caisse du Jour', val: '2 845 000 FCFA', detail: 'Monetbil (65%) · Espèces (35%)', icon: Wallet, color: 'from-purple-600 to-violet-600', badge: 'Rapproché' },
  ]

  const liveDepartures = [
    { code: 'VOY-001', depart: 'Yaoundé Mvan', arrivee: 'Douala Bépanda', heure: '07:30', bus: 'Marcopolo G7 · LT-542-AA', classe: 'VIP', places: '68/70', statut: 'EN_ROUTE', speed: '108 km/h' },
    { code: 'VOY-002', depart: 'Yaoundé Mvan', arrivee: 'Douala Bépanda', heure: '09:00', bus: 'Toyota Coaster · CE-892-BC', classe: 'Standard', places: '48/50', statut: 'EMBARQUEMENT', speed: '0 km/h' },
    { code: 'VOY-003', depart: 'Douala Bépanda', arrivee: 'Yaoundé Mvan', heure: '11:00', bus: 'Marcopolo G7 · LT-441-AA', classe: 'VIP', places: '32/70', statut: 'OUVERT', speed: '—' },
  ]

  const modules = [
    { title: 'Guichet & Billetterie', desc: 'Vente express, plan des sièges 2D et encaissement Monetbil / Cash', path: '/app/billetterie', icon: Ticket, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    { title: 'Fret, Messagerie & Colis', desc: 'Pesée au kilo, tarification auto et étiquetage code-barres', path: '/app/colis', icon: Package, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    { title: 'Gestion de Caisse', desc: 'Sessions guichet, journal d\'encaissement et clôture comptable', path: '/app/caisse', icon: Wallet, color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
    { title: 'Supervision Flotte GPS', desc: 'Tracé interactif Nationale 3 et détection automatique des survitesses', path: '/app/gps', icon: MapPin, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20' },
    { title: 'Atelier & Maintenance', desc: 'Contrôles techniques, vidanges périodiques et conformité bus', path: '/app/maintenance', icon: Wrench, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
    { title: 'Administration Système', desc: 'Base 43 tables, rôles RBAC, lignes, tarifs et sécurité DCL', path: '/app/admin', icon: Shield, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  ]

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          HERO BANNER DE BIENVENUE LUXE & STATUT OPÉRATIONNEL
         ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Zap size={14} className="fill-current animate-pulse" />
              <span>Tableau de Bord Exécutif · God Travel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">{user?.prenom} {user?.nom}</span> 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervision temps réel du corridor <strong className="text-white">Yaoundé Mvan ⇄ Douala Bépanda</strong>. Flotte active, recettes guichet et fret centralisés sur base relationnelle 43 tables.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <Link
              to="/app/billetterie"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.4)] transition transform hover:-translate-y-0.5"
            >
              <Ticket size={16} className="stroke-[2.5]" />
              <span>Émettre un Billet</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to="/app/gps"
              className="px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              <Navigation size={15} className="text-cyan-400" />
              <span>Voir la Carte GPS Live</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          CARTES DE MÉTRIQUES & KPIS EN TEMPS RÉEL
         ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon
          return (
            <div 
              key={idx} 
              className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-400/40 hover:bg-slate-900 transition-all duration-200 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">
                  {s.label}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  {s.badge}
                </span>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-black text-white tracking-tight group-hover:text-amber-400 transition">
                  {s.val}
                </span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition`}>
                  <Icon size={20} className="stroke-[2]" />
                </div>
              </div>

              <p className="mt-2 text-xs text-slate-400 font-medium">
                {s.detail}
              </p>
            </div>
          )
        })}
      </div>

      {/* ========================================================
          TABLEAU DES DÉPARTS EN DIRECT + SUIVI DU CORRIDOR N3
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Départs du Jour (Style TGV / Gare Moderne) */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-black text-white tracking-wide">
                Départs du Jour · Ligne Yaoundé ⇄ Douala
              </h2>
            </div>
            <Link to="/app/billetterie" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1">
              <span>Voir tout</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {liveDepartures.map((d, i) => (
              <div key={i} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-800/40 px-3 -mx-3 rounded-xl transition">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-12 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-black text-amber-400 font-mono">{d.heure}</span>
                    <span className="text-[9px] font-bold text-slate-500">{d.classe}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{d.depart}</span>
                      <ArrowRight size={12} className="text-amber-400" />
                      <span>{d.arrivee}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Bus : <span className="font-mono text-slate-300">{d.bus}</span> · Sièges : <span className="font-bold text-white">{d.places}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3">
                  {d.speed !== '—' && (
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      ⚡ {d.speed}
                    </span>
                  )}
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    d.statut === 'EN_ROUTE' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse' :
                    d.statut === 'EMBARQUEMENT' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {d.statut.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Télémétrie & État du Corridor N3 */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800/80 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h2 className="text-base font-black text-white tracking-wide">
                État Route Nationale 3
              </h2>
            </div>
            
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Section Mvan – Mbankomo :</span>
                <span className="font-bold text-emerald-400">Fluide (90 km/h)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pont Sanaga (Édéa) :</span>
                <span className="font-bold text-emerald-400">Trafic Normal</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Entrée Bépanda (Douala) :</span>
                <span className="font-bold text-amber-400">Ralentissement léger</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Conditions Météo :</span>
                <span className="font-bold text-white">Temps sec · Visibilité 100%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <p className="font-black flex items-center gap-1.5">
              <Shield size={14} className="text-amber-400" />
              Régulation Vitesse & Sécurité
            </p>
            <p className="mt-1 text-[11px] text-amber-200/80 leading-relaxed">
              Tout dépassement au-delà de 100 km/h est journalisé automatiquement par le déclencheur SQL <code className="bg-amber-400/20 px-1 rounded text-amber-300">TRG_ALERTE_SURVITESSE_GPS</code>.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          ACCÈS RAPIDE AUX MODULES MÉTIER
         ======================================================== */}
      <div>
        <h2 className="text-sm font-mono font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Activity size={16} className="text-amber-400" />
          Accès Direct aux Postes de Travail
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((m, idx) => {
            const Icon = m.icon
            return (
              <Link
                key={idx}
                to={m.path}
                className="group p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/50 hover:bg-slate-900 transition-all duration-200 flex flex-col justify-between shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition group-hover:scale-105 ${m.color}`}>
                    <Icon size={22} className="stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white group-hover:text-amber-400 transition">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-amber-400 transition">
                  <span>Accéder à l'écran</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
