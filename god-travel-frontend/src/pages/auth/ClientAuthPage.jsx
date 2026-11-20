import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@api/index'
import { useAuthStore } from '@store/authStore'
import { authenticatedDestination, isValidCmMobile, normalizeCmPhone, normalizeRole } from '@utils/domain'

export default function ClientAuthPage({ initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ prenom: '', nom: '', telephone: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const passwordStrength = useMemo(() => [form.password.length >= 8, /[A-Z]/.test(form.password), /[a-z]/.test(form.password), /\d/.test(form.password), /[^A-Za-z0-9]/.test(form.password)].filter(Boolean).length, [form.password])

  const submit = async (event) => {
    event.preventDefault(); setFormError('')
    if (mode === 'register' && !isValidCmMobile(form.telephone)) { setFormError('Saisissez un numéro mobile camerounais à 9 chiffres, commençant par 6.'); return }
    setLoading(true)
    try {
      const payload = { prenom: form.prenom.trim(), nom: form.nom.trim(), telephone: mode === 'register' ? normalizeCmPhone(form.telephone) : form.telephone.trim(), email: form.email.trim(), password: form.password }
      const response = mode === 'register' ? await authApi.inscrireClient(payload) : await authApi.loginClient({ login: payload.email, password: payload.password })
      const data = response.data?.data
      if (!data?.token) throw new Error(response.data?.message || 'Connexion impossible.')
      const rawRole = normalizeRole(data.role || 'CLIENT')
      const [prenom = '', ...nomParts] = (data.nomComplet || data.login || payload.email).split(' ')
      setAuth(data.token, { id: data.idUtilisateur, login: data.login, email: data.login, prenom: prenom || 'Utilisateur', nom: nomParts.join(' ') || '', telephone: data.telephone, nomComplet: data.nomComplet, role: rawRole, agenceId: data.idAgence, agenceNom: data.nomAgence })
      toast.success(mode === 'register' ? 'Votre compte est prêt.' : `Bienvenue${prenom ? `, ${prenom}` : ''}.`)
      navigate(authenticatedDestination(rawRole, location.state?.from || params.get('returnTo')), { replace: true })
    } catch {
      const message = mode === 'register' ? 'Impossible de créer le compte avec ces informations. Vérifiez les champs ou connectez-vous si vous avez déjà un compte.' : 'Adresse e-mail ou mot de passe incorrect.'
      setFormError(message); toast.error(message)
    } finally { setLoading(false) }
  }

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))
  return <main className="login-page client-login-page">
    <section className="login-image-panel"><Link to="/" className="login-brand"><img src="/god-travel-logo.jpg" alt="" /><span>God-<b>travel</b></span></Link><div className="login-image-copy"><span className="section-kicker">ESPACE VOYAGEUR</span><h1>Un billet. Votre place. Votre voyage.</h1><p>Réservez en ligne, retrouvez vos titres de transport et gardez les informations de votre départ avec vous.</p></div><div className="login-route-note"><span>YAOUNDÉ · NVAN</span><span>DOUALA · BÉPANDA</span></div></section>
    <section className="login-form-panel"><Link to="/" className="login-back"><ArrowLeft size={15} /> Accueil</Link><div className="login-form-inner"><span className="login-kicker">{mode === 'register' ? 'COMPTE VOYAGEUR' : 'ESPACE CONNEXION'}</span><h2>{mode === 'register' ? 'Créer un compte' : 'Bienvenue'}</h2><p className="login-intro">{mode === 'register' ? 'Vos coordonnées servent à gérer vos réservations et vos billets.' : 'Saisissez vos identifiants pour accéder à votre espace.'}</p>{params.has('returnTo') && <p className="session-expired-note" role="status">Votre session a expiré. Reconnectez-vous pour continuer.</p>}
      <div className="client-auth-tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Connexion</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Créer un compte</button></div>
      <form className="client-auth-form" onSubmit={submit}>
        {mode === 'register' && <><label htmlFor="client-firstname">Prénom<div><UserRound size={16} /><input id="client-firstname" required autoComplete="given-name" maxLength={50} value={form.prenom} onChange={(event) => update('prenom', event.target.value)} /></div></label><label htmlFor="client-lastname">Nom<div><UserRound size={16} /><input id="client-lastname" required autoComplete="family-name" maxLength={50} value={form.nom} onChange={(event) => update('nom', event.target.value)} /></div></label><label htmlFor="client-phone">Téléphone<div><Phone size={16} /><input id="client-phone" required type="tel" inputMode="tel" autoComplete="tel" maxLength={20} value={form.telephone} onChange={(event) => update('telephone', event.target.value)} placeholder="6 99 00 00 00" aria-describedby="client-phone-hint" /></div><small id="client-phone-hint">Mobile camerounais : 9 chiffres, commençant par 6.</small></label></>}
        <label htmlFor="client-email">Adresse e-mail<div><Mail size={16} /><input id="client-email" required type="email" autoComplete="email" maxLength={120} value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="vous@exemple.com" /></div></label>
        <label htmlFor="client-password">Mot de passe<div><LockKeyhole size={16} /><input id="client-password" required minLength={8} maxLength={72} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
        {mode === 'register' && <div className="password-strength" aria-live="polite"><div className="strength-bars">{[1, 2, 3, 4, 5].map((part) => <i key={part} className={passwordStrength >= part ? 'is-filled' : ''} />)}</div><span>{passwordStrength < 3 ? 'Choisissez un mot de passe plus robuste' : passwordStrength < 5 ? 'Mot de passe correct' : 'Mot de passe robuste'}</span></div>}
        {formError && <p className="client-auth-error" role="alert">{formError}</p>}
        {mode === 'register' && <p className="privacy-note">Vos informations sont utilisées pour gérer le compte et les réservations. <Link to="/confidentialite">Lire la politique de confidentialité</Link>. Le serveur ne propose pas encore l’enregistrement du consentement.</p>}
        <button className="login-submit" type="submit" disabled={loading}>{loading ? <><span>Un instant…</span><span className="button-spinner" /></> : <><span>{mode === 'register' ? 'Créer mon compte' : 'Me connecter'}</span><ArrowRight size={17} /></>}</button>
      </form>
    </div><div className="login-foot"><span>GOD TRAVEL</span><span>YAOUNDÉ — DOUALA</span></div></section>
  </main>
}
