import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import MainLayout from '@components/layout/MainLayout'
import LandingPage from '@pages/LandingPage'
import LoginPage from '@pages/auth/LoginPage'
import ClientAuthPage from '@pages/auth/ClientAuthPage'
import ClientAccountPage from '@pages/client/ClientAccountPage'
import CustomerBookingPage from '@pages/client/CustomerBookingPage'
import TicketLookupPage from '@pages/TicketLookupPage'
import PaymentReturnPage from '@pages/PaymentReturnPage'
import DashboardPage from '@pages/dashboard/DashboardPage'
import BilletteriePage from '@pages/billetterie/BilletteriePage'
import ColisPage from '@pages/colis/ColisPage'
import CaissePage from '@pages/caisse/CaissePage'
import GpsPage from '@pages/gps/GpsPage'
import MaintenancePage from '@pages/maintenance/MaintenancePage'
import AdminPage from '@pages/admin/AdminPage'

function StaffRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.user?.role)
  if (!token) return <Navigate to="/login" replace />
  return role === 'ROLE_CLIENT' ? <Navigate to="/mon-espace" replace /> : children
}

function ClientRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.user?.role)
  if (!token || role !== 'ROLE_CLIENT') return <Navigate to="/connexion" replace />
  return children
}

export default function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/connexion" element={<ClientAuthPage />} />
    <Route path="/inscription" element={<ClientAuthPage initialMode="register" />} />
    <Route path="/billet" element={<TicketLookupPage />} />
    <Route path="/paiement/retour" element={<PaymentReturnPage />} />
    <Route path="/mon-espace" element={<ClientRoute><ClientAccountPage /></ClientRoute>} />
    <Route path="/reserver" element={<ClientRoute><CustomerBookingPage /></ClientRoute>} />
    <Route path="/app" element={<StaffRoute><MainLayout /></StaffRoute>}>
      <Route index element={<DashboardPage />} />
      <Route path="billetterie" element={<BilletteriePage />} />
      <Route path="colis" element={<ColisPage />} />
      <Route path="caisse" element={<CaissePage />} />
      <Route path="gps" element={<GpsPage />} />
      <Route path="maintenance" element={<MaintenancePage />} />
      <Route path="admin" element={<AdminPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
