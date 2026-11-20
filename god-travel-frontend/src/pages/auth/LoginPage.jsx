import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@api/index'
import { useAuthStore } from '@store/authStore'
import { authenticatedDestination, normalizeRole } from '@utils/domain'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await authApi.login({ login: login.trim(), password })
      const data = response?.data?.data
      if (!data?.token) throw new Error('Le serveur n’a pas retourné de session valide.')
      const [prenom = '', ...nomParts] = (data.nomComplet || data.login || login).split(' ')
      const role = normalizeRole(data.role || 'UTILISATEUR')
      setAuth(data.token, { id: data.idUtilisateur, login: data.login, email: data.login, prenom: prenom || 'Utilisateur', nom: nomParts.join(' ') || 'God Travel', nomComplet: data.nomComplet, role, agenceId: data.idAgence, agenceNom: data.nomAgence })
      toast.success(`Bienvenue${prenom ? `, ${prenom}` : ''}.`)
      navigate(authenticatedDestination(role, location.state?.from || params.get('returnTo')), { replace: true })
    } catch {
      toast.error('Identifiant ou mot de passe incorrect.')
    } finally { setLoading(false) }
  }

  return <main className="login-page">
    <section className="login-image-panel">
      <Link to="/" className="login-brand"><img src="/god-travel-logo.jpg" alt="" /><span>God-<b>travel</b></span></Link>
      <div className="login-image-copy"><span className="section-kicker">UNITED EXPRESS · CAMEROUN</span><h1>Le bon départ commence ici.</h1><p>Un espace de travail clair pour celles et ceux qui préparent, accompagnent et sécurisent chaque voyage.</p></div>
      <div className="login-route-note"><span>YAOUNDÉ</span><span>DOUALA · N3</span></div>
    </section>
    <section className="login-form-panel">
      <Link to="/" className="login-back"><ArrowLeft size={15} /> Retour au site public</Link>
      <div className="login-form-inner"><span className="login-kicker">ESPACE GOD TRAVEL</span><h2>Connexion</h2><p className="login-intro">Saisissez l’adresse e-mail et le mot de passe de votre compte.</p>
        {params.has('returnTo') && <p className="session-expired-note" role="status">Votre session a expiré. Reconnectez-vous pour reprendre votre activité.</p>}
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="staff-login">Adresse e-mail</label>
          <div className="login-input-wrap"><Mail size={16} aria-hidden="true" /><input id="staff-login" name="login" autoComplete="username" required value={login} onChange={(event) => setLogin(event.target.value)} placeholder="nom@agence.cm" /></div>
          <div className="login-password-heading"><label htmlFor="staff-password">Mot de passe</label></div>
          <div className="login-input-wrap"><LockKeyhole size={16} aria-hidden="true" /><input id="staff-password" name="password" autoComplete="current-password" required type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Votre mot de passe" /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          <button className="login-submit" type="submit" disabled={loading}>{loading ? <><span>Vérification en cours…</span><span className="button-spinner" /></> : <><span>Ouvrir mon espace</span><ArrowRight size={17} /></>}</button>
        </form>
        <p className="login-help">Votre profil et vos autorisations sont déterminés par le serveur. <span>Besoin d’un compte ? Contactez votre administrateur.</span></p>
      </div>
      <div className="login-foot"><span>GOD TRAVEL</span><span>ACCÈS SÉCURISÉ</span></div>
    </section>
  </main>
}
