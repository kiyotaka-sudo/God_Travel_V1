import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@api/index'
import { useAuthStore } from '@store/authStore'

export default function ClientAuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const location = useLocation()

  const submit = async (event) => {
    event.preventDefault(); setLoading(true)
    try {
      const response = mode === 'register'
        ? await authApi.inscrireClient(form)
        : await authApi.loginClient({ login: form.email, password: form.password })
      const data = response.data?.data
      if (!data?.token) throw new Error(response.data?.message || 'Connexion impossible.')
      setAuth(data.token, { id: data.idUtilisateur, login: data.login, email: data.login, telephone: data.telephone, nomComplet: data.nomComplet, role: 'ROLE_CLIENT' })
      toast.success(mode === 'register' ? 'Votre compte est prêt.' : 'Bienvenue dans votre espace.')
      navigate(location.state?.from || '/mon-espace', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Impossible de créer le compte.')
    } finally { setLoading(false) }
  }

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))
  return <main className="client-auth-page">
    <header className="ticket-public-nav"><Link to="/" className="landing-wordmark"><img src="/god-travel-logo.jpg" alt="" /><span>GOD<span>TRAVEL</span></span></Link><Link to="/" className="ticket-back-link"><ArrowLeft size={15} /> Accueil</Link></header>
    <section className="client-auth-card"><div className="ticket-kicker"><span /> ESPACE VOYAGEUR</div><h1>{mode === 'register' ? 'Votre voyage commence ici.' : 'Heureux de vous revoir.'}</h1><p>Réservez votre place, retrouvez vos billets et gardez votre voyage à portée de main.</p>
      <div className="client-auth-tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Connexion</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Créer un compte</button></div>
      <form onSubmit={submit} className="client-auth-form">
        {mode === 'register' && <><label>Prénom<div><UserRound size={16} /><input required autoComplete="given-name" value={form.prenom} onChange={(e) => update('prenom', e.target.value)} /></div></label><label>Nom<div><UserRound size={16} /><input required autoComplete="family-name" value={form.nom} onChange={(e) => update('nom', e.target.value)} /></div></label><label>Téléphone<div><Phone size={16} /><input required type="tel" autoComplete="tel" value={form.telephone} onChange={(e) => update('telephone', e.target.value)} placeholder="6 99 00 00 00" /></div></label></>}
        <label>Adresse e-mail<div><Mail size={16} /><input required type="email" autoComplete="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="vous@exemple.com" /></div></label>
        <label>Mot de passe<div><LockKeyhole size={16} /><input required minLength={8} type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={form.password} onChange={(e) => update('password', e.target.value)} /></div></label>
        <button className="client-auth-submit" disabled={loading}>{loading ? 'Un instant…' : mode === 'register' ? 'Créer mon compte' : 'Me connecter'} <ArrowRight size={17} /></button>
      </form>
      <div className="client-auth-staff">Vous faites partie de l’équipe ? <Link to="/login">Accès professionnel</Link></div>
    </section>
  </main>
}
