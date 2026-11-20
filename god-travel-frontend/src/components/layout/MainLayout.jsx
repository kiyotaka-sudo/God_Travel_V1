import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Ticket, Package, Wallet, MapPinned, Wrench, Shield, LogOut, Menu, X, ArrowLeft, Wifi, WifiOff, ScanLine, Truck, Users } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import ThemeToggle from '@components/ThemeToggle'

const menuItems = [
  { label: 'Vue d’ensemble', path: '/app', icon: LayoutDashboard, roles: ['ROLE_ADMIN'] },
  { label: 'Guichet & Billetterie', path: '/app/billetterie', icon: Ticket, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER'] },
  { label: 'Fret & Colis', path: '/app/colis', icon: Package, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER'] },
  { label: 'Caisse & Sessions', path: '/app/caisse', icon: Wallet, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER', 'ROLE_COMPTABLE'] },
  { label: 'Suivi flotte GPS', path: '/app/gps', icon: MapPinned, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE'] },
  { label: 'Embarquement', path: '/app/embarquement', icon: ScanLine, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_HOTESSE'] },
  { label: 'Espace chauffeur', path: '/app/chauffeur', icon: Truck, roles: ['ROLE_CHAUFFEUR'] },
  { label: 'Équipage des voyages', path: '/app/equipage', icon: Users, roles: ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE'] },
  { label: 'Atelier & Maintenance', path: '/app/maintenance', icon: Wrench, roles: ['ROLE_ADMIN', 'ROLE_MECANICIEN'] },
  { label: 'Administration', path: '/app/admin', icon: Shield, roles: ['ROLE_ADMIN'] },
]

export default function MainLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [online, setOnline] = useState(() => navigator.onLine)
  const [clock, setClock] = useState(() => new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', dateStyle: 'medium', timeStyle: 'short' }).format(new Date()))
  const accessibleItems = useMemo(() => menuItems.filter((item) => item.roles.includes(user?.role)), [user?.role])
  const currentPage = menuItems.find((item) => item.path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(item.path))?.label || 'Espace de travail'

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    const timer = window.setInterval(() => setClock(new Intl.DateTimeFormat('fr-FR', { timeZone: 'Africa/Douala', dateStyle: 'medium', timeStyle: 'short' }).format(new Date())), 60_000)
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOffline)
    return () => { clearInterval(timer); window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  const signOut = () => { logout(); navigate('/', { replace: true }) }
  return <div className="app-shell">
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Fermer le menu" onClick={() => setSidebarOpen(false)} />}
    <aside className={`app-sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="Navigation de l’espace équipe">
      <div className="app-brand-row"><Link to="/app" className="app-brand"><img src="/god-travel-logo.jpg" alt="" /><span>God-<b>travel</b></span></Link><button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu"><X size={18} /></button></div>
      <div className="app-agency"><i className="agency-indicator" /><div><small>AGENCE RATTACHÉE</small><strong>{user?.agenceNom || 'Agence non renseignée'}</strong></div></div>
      <p className="sidebar-section-label">VOTRE ESPACE</p>
      <nav className="app-navigation">{accessibleItems.map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={item.path} end={item.path === '/app'} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}><Icon size={17} /><span>{item.label}</span>{location.pathname === item.path && <i />}</NavLink> })}</nav>
      <div className="sidebar-bottom"><div className="app-user"><span className="user-monogram">{(user?.prenom?.[0] || user?.login?.[0] || 'U').toUpperCase()}</span><div className="user-details"><strong>{user?.nomComplet || [user?.prenom, user?.nom].filter(Boolean).join(' ') || user?.login || 'Utilisateur'}</strong><span>{user?.role?.replace('ROLE_', '').replaceAll('_', ' ') || 'ÉQUIPE'}</span></div><button type="button" title="Déconnexion" onClick={signOut} aria-label="Déconnexion"><LogOut size={16} /></button></div><Link to="/" className="back-public"><ArrowLeft size={14} /> Site public</Link></div>
    </aside>
    <div className="app-workspace"><header className="app-topbar"><div className="topbar-left"><button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Ouvrir le menu"><Menu size={20} /></button><div className="breadcrumb"><span>ESPACE ÉQUIPE</span><b>/</b><strong>{currentPage}</strong></div></div><div className="topbar-right"><span className={`system-status ${online ? 'is-online' : 'is-offline'}`}>{online ? <Wifi size={14} /> : <WifiOff size={14} />}<span>{online ? 'En ligne' : 'Hors ligne · synchronisation indisponible'}</span></span><time className="topbar-date">{clock}</time><ThemeToggle compact /></div></header><main className="app-content"><Outlet /></main></div>
  </div>
}
