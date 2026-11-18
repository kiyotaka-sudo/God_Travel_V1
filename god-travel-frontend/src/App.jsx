import { lazy, Suspense, useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import api from '@api/axios'
import BootSplash from '@components/BootSplash'
import { isRoleAllowed, normalizeRole } from '@utils/domain'

const MainLayout = lazy(() => import('@components/layout/MainLayout'))
const LandingPage = lazy(() => import('@pages/LandingPage'))
const LoginPage = lazy(() => import('@pages/auth/LoginPage'))
const ClientAuthPage = lazy(() => import('@pages/auth/ClientAuthPage'))
const ClientAccountPage = lazy(() => import('@pages/client/ClientAccountPage'))
const CustomerBookingPage = lazy(() => import('@pages/client/CustomerBookingPage'))
const TicketLookupPage = lazy(() => import('@pages/TicketLookupPage'))
const PaymentReturnPage = lazy(() => import('@pages/PaymentReturnPage'))
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'))
const BilletteriePage = lazy(() => import('@pages/billetterie/BilletteriePage'))
const ColisPage = lazy(() => import('@pages/colis/ColisPage'))
const CaissePage = lazy(() => import('@pages/caisse/CaissePage'))
const GpsPage = lazy(() => import('@pages/gps/GpsPage'))
const MaintenancePage = lazy(() => import('@pages/maintenance/MaintenancePage'))
const AdminPage = lazy(() => import('@pages/admin/AdminPage'))
const SmoothScroll = lazy(() => import('@components/SmoothScroll'))

function PageLoading() {
  return <main className="route-loading" role="status"><img src="/god-travel-logo.jpg" alt="" /><span>Ouverture de votre espace…</span></main>
}

const staff = ['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER', 'ROLE_HOTESSE', 'ROLE_CHAUFFEUR', 'ROLE_MECANICIEN', 'ROLE_COMPTABLE']

function AccessDenied() {
  return <main className="status-page"><div className="status-card"><ShieldAlert size={28} /><span className="eyebrow">AUTORISATION</span><h1>Accès non autorisé</h1><p>Votre profil ne permet pas d’ouvrir cet espace. Demandez l’accès au responsable de votre agence.</p><Link className="button-primary" to="/">Retour à l’accueil</Link></div></main>
}

function NotFound() {
  return <main className="status-page"><div className="status-card"><span className="eyebrow">PAGE INTROUVABLE</span><h1>Ce trajet n’existe pas.</h1><p>Le lien est incorrect ou cette page a été déplacée.</p><Link className="button-primary" to="/">Revenir à l’accueil</Link></div></main>
}

function RoleHome() {
  const role = normalizeRole(useAuthStore((s) => s.user?.role))
  if (role === 'ROLE_ADMIN') return <DashboardPage />
  if (role === 'ROLE_CHEF_AGENCE' || role === 'ROLE_GUICHETIER') return <Navigate to="/app/billetterie" replace />
  if (role === 'ROLE_COMPTABLE') return <Navigate to="/app/caisse" replace />
  if (role === 'ROLE_MECANICIEN') return <Navigate to="/app/maintenance" replace />
  return <main className="status-page"><div className="status-card"><span className="eyebrow">ESPACE ÉQUIPE</span><h1>Votre espace se prépare.</h1><p>Le rôle {role.replace('ROLE_', '').replaceAll('_', ' ')} est reconnu, mais le backend ne fournit pas encore les opérations nécessaires à cet écran.</p><Link className="button-primary" to="/">Retour au site</Link></div></main>
}

function Protected({ roles, children, client = false }) {
  const token = useAuthStore((s) => s.token)
  const role = normalizeRole(useAuthStore((s) => s.user?.role))
  const location = useLocation()
  if (!token) return <Navigate to={client ? '/connexion' : '/login'} replace state={{ from: location.pathname + location.search }} />
  if (!isRoleAllowed(role, client ? ['ROLE_CLIENT'] : roles)) return <AccessDenied />
  return children
}

function ApiStatusNotice() {
  const [denied, setDenied] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const onForbidden = () => setDenied(true)
    window.addEventListener('godtravel:forbidden', onForbidden)
    return () => window.removeEventListener('godtravel:forbidden', onForbidden)
  }, [])
  useEffect(() => setDenied(false), [location.pathname])
  if (!denied) return null
  return <div className="api-denied-overlay" role="alertdialog" aria-modal="true" aria-labelledby="api-denied-title"><div><ShieldAlert /><h2 id="api-denied-title">Accès refusé par le serveur</h2><p>Votre profil ne dispose pas de l’autorisation nécessaire pour cette action.</p><button className="button-primary" onClick={() => { setDenied(false); navigate(-1) }}><ArrowLeft size={16} /> Retour</button></div></div>
}

function SessionHydration() {
  const token = useAuthStore((s) => s.token)
  const updateUser = useAuthStore((s) => s.updateUser)
  useEffect(() => {
    if (!token) return
    let active = true
    api.get('/auth/me').then((response) => {
      if (!active) return
      const data = response.data?.data
      if (data) updateUser({ id: data.idUtilisateur, login: data.login, email: data.login, nomComplet: data.nomComplet, telephone: data.telephone, role: normalizeRole(data.role), agenceId: data.idAgence, agenceNom: data.nomAgence })
    }).catch(() => {})
    return () => { active = false }
  }, [token, updateUser])
  return null
}

export default function App() {
  const location = useLocation()
  const role = normalizeRole(useAuthStore((s) => s.user?.role))
  const isStaff = staff.includes(role)
  const [bootReady, setBootReady] = useState(false)
  useEffect(() => {
    let active = true
    const logo = new Image(); logo.src = '/god-travel-logo.jpg'
    const assetsReady = new Promise((resolve) => { if (logo.complete) resolve(); else { logo.onload = resolve; logo.onerror = resolve } })
    Promise.all([assetsReady, new Promise((resolve) => window.setTimeout(resolve, 850))]).then(() => { if (active) setBootReady(true) })
    return () => { active = false }
  }, [])
  return <>
    {!bootReady && <BootSplash />}
    <SessionHydration />
    {location.pathname === '/' && <Suspense fallback={null}><SmoothScroll /></Suspense>}
    <ApiStatusNotice />
    <Suspense fallback={<PageLoading />}><Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={isStaff ? <Navigate to="/app" replace /> : <LoginPage />} />
      <Route path="/connexion" element={<ClientAuthPage />} />
      <Route path="/inscription" element={<ClientAuthPage initialMode="register" />} />
      <Route path="/billet" element={<TicketLookupPage />} />
      <Route path="/paiement/retour" element={<PaymentReturnPage />} />
      <Route path="/confidentialite" element={<PrivacyPage />} />
      <Route path="/mon-espace" element={<Protected client><ClientAccountPage /></Protected>} />
      <Route path="/reserver" element={<Protected client><CustomerBookingPage /></Protected>} />
      <Route path="/app" element={<Protected roles={staff}><MainLayout /></Protected>}>
        <Route index element={<Protected roles={staff}><RoleHome /></Protected>} />
        <Route path="billetterie" element={<Protected roles={['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER']}><BilletteriePage /></Protected>} />
        <Route path="colis" element={<Protected roles={['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER']}><ColisPage /></Protected>} />
        <Route path="caisse" element={<Protected roles={['ROLE_ADMIN', 'ROLE_CHEF_AGENCE', 'ROLE_GUICHETIER', 'ROLE_COMPTABLE']}><CaissePage /></Protected>} />
        <Route path="gps" element={<Protected roles={['ROLE_ADMIN', 'ROLE_CHEF_AGENCE']}><GpsPage /></Protected>} />
        <Route path="maintenance" element={<Protected roles={['ROLE_ADMIN', 'ROLE_MECANICIEN']}><MaintenancePage /></Protected>} />
        <Route path="admin" element={<Protected roles={['ROLE_ADMIN']}><AdminPage /></Protected>} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes></Suspense>
  </>
}

function PrivacyPage() {
  return <main className="privacy-page"><header className="ticket-public-nav"><Link to="/" className="landing-wordmark"><img src="/god-travel-logo.jpg" alt="" /><span>God-<span>travel</span></span></Link><Link to="/" className="ticket-back-link"><ArrowLeft size={15} /> Accueil</Link></header><article><span className="section-kicker">DONNÉES PERSONNELLES</span><h1>Confidentialité</h1><p>God Travel utilise les informations nécessaires à la création du compte, à la réservation et à la vérification du billet : nom, prénom, adresse e-mail et téléphone. La réservation peut aussi demander une pièce d’identité.</p><h2>Utilisation</h2><p>Ces informations sont utilisées pour gérer votre compte et vos titres de transport. Le numéro de téléphone peut servir à vérifier un billet ou un paiement Monetbil.</p><h2>Vos droits et contact</h2><p>Pour demander l’accès ou la rectification de vos informations, adressez-vous à votre agence God Travel. L’application ne propose pas encore de formulaire en ligne pour exercer ces demandes.</p><p className="privacy-note">Cette page décrit le fonctionnement constaté dans l’application. La durée de conservation et le canal de contact officiel doivent être précisés par l’exploitant avant mise en production.</p><Link to="/" className="story-inline-link"><ArrowLeft size={15} /> Retour à l’accueil</Link></article></main>
}
