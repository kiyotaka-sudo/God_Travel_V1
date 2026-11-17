import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@api/index'
import { useAuthStore } from '@store/authStore'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const setAuth = useAuthStore((state) => state.setAuth)
  const navigate = useNavigate()

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await authApi.login({ login: login.trim(), password })
      const data = response?.data?.data
      if (!data?.token) throw new Error('Le serveur n’a pas retourné de session valide.')

      const [prenom = '', ...nomParts] = (data.nomComplet || data.login || login).split(' ')
      const role = data.role?.startsWith('ROLE_') ? data.role : `ROLE_${data.role || 'UTILISATEUR'}`
      setAuth(data.token, {
        id: data.idUtilisateur,
        login: data.login,
        email: data.login,
        prenom: prenom || 'Utilisateur',
        nom: nomParts.join(' ') || 'God Travel',
        role,
        agenceId: data.idAgence,
        agenceNom: data.nomAgence,
      })
      toast.success(`Bienvenue sur God Travel, ${prenom} !`)
      navigate('/app', { replace: true })
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Identifiant ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Halos de lumière de fond */}
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      {/* Bouton retour */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center text-xs">
        <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-1.5 transition">
          <ArrowLeft size={14} />
          <span>Retour au site public</span>
        </Link>
        <span className="text-slate-500">Espace équipe</span>
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 relative z-10 backdrop-blur-xl">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.4)]">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-black text-amber-400 text-2xl tracking-wider">GT</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Connexion Opérateurs
          </h1>
          <p className="text-xs text-slate-400">
            God Travel · Plateforme United Express (Cameroun)
          </p>
        </div>

        {/* Formulaire de connexion */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Identifiant / E-mail Professionnel
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <LockKeyhole size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(245,158,11,0.4)] transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {loading ? (
              <span>Authentification en cours...</span>
            ) : (
              <>
                <span>Accéder à mon Poste de Travail</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-500">
          Votre rôle et vos autorisations sont vérifiés par le serveur après authentification.
        </p>
      </div>
    </main>
  )
}
