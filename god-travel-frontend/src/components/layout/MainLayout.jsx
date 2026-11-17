import React, { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  BusFront, LayoutDashboard, Ticket, Package, Wallet, 
  MapPinned, Wrench, Shield, LogOut, Menu, X, ArrowLeft,
  Bell, Search, Clock, CheckCircle2, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import BusBanner from '@components/bus/BusBanner'

const menuItems = [
  { label: 'Vue d’ensemble', path: '/app', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE'] },
  { label: 'Guichet & Billetterie', path: '/app/billetterie', icon: Ticket, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER'] },
  { label: 'Fret & Colis', path: '/app/colis', icon: Package, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER'] },
  { label: 'Caisse & Sessions', path: '/app/caisse', icon: Wallet, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER', 'ROLE_COMPTABLE'] },
  { label: 'Suivi Flotte GPS Live', path: '/app/gps', icon: MapPinned, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE'] },
  { label: 'Atelier & Maintenance', path: '/app/maintenance', icon: Wrench, roles: ['ROLE_ADMIN', 'ROLE_MECANICIEN'] },
  { label: 'Administration & Base', path: '/app/admin', icon: Shield, roles: ['ROLE_ADMIN'] },
]

export default function MainLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const accessibleItems = menuItems.filter((item) => 
    !user?.role || item.roles.includes(user?.role)
  )

  const currentPage = menuItems.find((item) => 
    item.path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(item.path)
  )?.label || 'Espace de Travail'

  const signOut = () => {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-400 selection:text-slate-950">
      
      {/* ========================================================
          1. BANNIÈRE PERMANENTE DU BUS QUI ROULE À FOND
         ======================================================== */}
      <BusBanner />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Voile sombre pour mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* ========================================================
            2. SIDEBAR HAUT DE GAMME (DESIGN PRO & ÉPURÉ)
           ======================================================== */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
          border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-out shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          {/* En-tête Marque & Logo */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <Link to="/app" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 transition transform">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <span className="font-black text-amber-400 text-lg tracking-wider">GT</span>
                </div>
              </div>
              <div>
                <h1 className="font-black text-base text-white tracking-wide group-hover:text-amber-400 transition flex items-center gap-1.5">
                  GOD TRAVEL
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30">PRO</span>
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">United Express · Cameroun</p>
              </div>
            </Link>

            <button 
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Badge Agence Active */}
          <div className="px-5 py-3.5 bg-slate-950/60 border-b border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400">Agence Opérationnelle</span>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">CONNECTÉ</span>
            </div>
            <p className="font-bold text-xs text-white mt-1 truncate flex items-center gap-1.5">
              <span>📍</span> {user?.agenceNom || 'Agence Centrale Mvan (Yaoundé)'}
            </p>
          </div>

          {/* Navigation Métier */}
          <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="px-3 pb-2 text-[10px] font-mono font-black uppercase text-slate-400 tracking-wider">
              Modules d'Exploitation
            </div>

            {accessibleItems.map((item) => {
              const Icon = item.icon
              const active = item.path === '/app' 
                ? location.pathname === '/app' 
                : location.pathname.startsWith(item.path)

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/app'}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-slate-950 shadow-[0_4px_15px_rgba(245,158,11,0.3)] font-black translate-x-1'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 hover:translate-x-0.5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={active ? 'text-slate-950 stroke-[2.5]' : 'text-slate-400 group-hover:text-amber-400 transition'} />
                    <span>{item.label}</span>
                  </div>
                  {active && <ChevronRight size={14} className="stroke-[3]" />}
                </NavLink>
              )
            })}
          </div>

          {/* Pied de Sidebar : Utilisateur & Déconnexion */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-sm shadow">
                {(user?.prenom?.[0] || user?.login?.[0] || 'U').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-[10px] font-mono text-amber-400 font-bold truncate">
                  {user?.role?.replace('ROLE_', '') || 'AGENT'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
              >
                <ArrowLeft size={13} />
                <span>Site Public</span>
              </Link>

              <button
                onClick={signOut}
                title="Se déconnecter"
                className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================
            3. ESPACE DE TRAVAIL & TOPBAR MODERNE
           ======================================================== */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          
          {/* Topbar */}
          <header className="h-16 px-6 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <button
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={22} />
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-slate-500 uppercase tracking-widest text-[11px]">Espace</span>
                <span className="text-slate-700">/</span>
                <span className="font-black text-white text-sm tracking-tight">{currentPage}</span>
              </div>
            </div>

            {/* Badges & Heure Locale */}
            <div className="flex items-center gap-4 text-xs">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-[11px]">
                <Clock size={13} className="text-amber-400" />
                <span>Heure Cameroun (GMT+1)</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                <CheckCircle2 size={13} />
                <span>Système Opérationnel</span>
              </div>
            </div>
          </header>

          {/* Contenu de la Page */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
