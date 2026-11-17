import React, { useState } from 'react'
import { 
  Package, Plus, Search, Truck, CheckCircle2, QrCode, 
  MapPin, Scale, User, Phone, ArrowRight, Printer, AlertCircle, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ColisPage() {
  const [colisList, setColisList] = useState([
    {
      id: 1,
      codeSuivi: 'GT-COL-7821',
      expediteur: 'Alain FOTSO',
      telExp: '+237 699 22 33 44',
      destinataire: 'Marie KENNE',
      telDest: '+237 677 11 22 33',
      agenceDepot: 'Yaoundé Mvan',
      agenceRetrait: 'Douala Bépanda',
      nature: 'Carton Matériel Informatique & Écrans',
      poidsKg: 14.5,
      valeurXaf: 150000,
      fraisXaf: 7500,
      statut: 'EN_TRANSIT',
      dateEnvoi: '17/11/2026 à 07:05',
    },
    {
      id: 2,
      codeSuivi: 'GT-COL-7822',
      expediteur: 'Jean NDONGO',
      telExp: '+237 655 44 33 22',
      destinataire: 'Samuel ETO',
      telDest: '+237 699 88 77 66',
      agenceDepot: 'Douala Bépanda',
      agenceRetrait: 'Yaoundé Mvan',
      nature: 'Plis Confidentiels & Dossiers Juridiques',
      poidsKg: 1.5,
      valeurXaf: 25000,
      fraisXaf: 2500,
      statut: 'RECU_DESTINATION',
      dateEnvoi: '17/11/2026 à 09:15',
    },
  ])

  const [expediteur, setExpediteur] = useState('')
  const [telExp, setTelExp] = useState('')
  const [destinataire, setDestinataire] = useState('')
  const [telDest, setTelDest] = useState('')
  const [nature, setNature] = useState('')
  const [poids, setPoids] = useState(5)
  const [valeur, setValeur] = useState(30000)
  const [recherche, setRecherche] = useState('')
  const [colisImprime, setColisImprime] = useState(null)

  // Calcul dynamique : 500 FCFA/kg avec plancher minimum de 2 500 FCFA
  const fraisCalcules = Math.max(2500, Math.round(poids * 500))

  const handleCreerColis = (e) => {
    e.preventDefault()
    if (!expediteur.trim() || !destinataire.trim() || !telDest.trim()) {
      toast.error('Veuillez renseigner toutes les coordonnées obligatoires.')
      return
    }

    const code = 'GT-COL-' + Math.floor(1000 + Math.random() * 9000)
    const nouveau = {
      id: Date.now(),
      codeSuivi: code,
      expediteur,
      telExp,
      destinataire,
      telDest,
      agenceDepot: 'Yaoundé Mvan',
      agenceRetrait: 'Douala Bépanda',
      nature,
      poidsKg: parseFloat(poids),
      valeurXaf: parseInt(valeur) || 0,
      fraisXaf: fraisCalcules,
      statut: 'ENREGISTRE',
      dateEnvoi: new Date().toLocaleString('fr-FR'),
    }

    setColisList([nouveau, ...colisList])
    setColisImprime(nouveau)
    toast.success(`Expédition ${code} enregistrée avec succès !`)
    
    // Reset
    setExpediteur('')
    setTelExp('')
    setDestinataire('')
    setTelDest('')
    setNature('')
    setPoids(5)
  }

  const filteredColis = colisList.filter(c => 
    c.codeSuivi.toLowerCase().includes(recherche.toLowerCase()) ||
    c.expediteur.toLowerCase().includes(recherche.toLowerCase()) ||
    c.destinataire.toLowerCase().includes(recherche.toLowerCase())
  )

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Package size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Fret, Messagerie & Expéditions Colis
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pesée automatique au kilo, bordereau code-barres et suivi inter-agences <strong className="text-white">Yaoundé Mvan ⇄ Douala Bépanda</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            Tarif de base : <strong className="text-emerald-400">500 FCFA / kg</strong> (Min. 2 500 F)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================================
            COLONNE GAUCHE (5/12) : NOUVELLE EXPÉDITION / ENREGISTREMENT
           ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Enregistrer un Colis</span>
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                Poids : {poids} kg
              </span>
            </div>

            <form onSubmit={handleCreerColis} className="space-y-4 text-xs">
              
              {/* Expéditeur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nom Expéditeur *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alain FOTSO"
                    value={expediteur}
                    onChange={(e) => setExpediteur(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Téléphone Expéditeur *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 699223344"
                    value={telExp}
                    onChange={(e) => setTelExp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Destinataire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nom Destinataire *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marie KENNE"
                    value={destinataire}
                    onChange={(e) => setDestinataire(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Téléphone Destinataire *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 677112233"
                    value={telDest}
                    onChange={(e) => setTelDest(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Description / Nature du Colis *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carton de vêtements, Pièces détachées, Documents..."
                  value={nature}
                  onChange={(e) => setNature(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition"
                />
              </div>

              {/* Poids et Valeur estimée */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Poids Pesé (kg) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={poids}
                    onChange={(e) => setPoids(parseFloat(e.target.value) || 0.5)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Valeur Déclarée (FCFA)</label>
                  <input
                    type="number"
                    value={valeur}
                    onChange={(e) => setValeur(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Tarif calculé en direct */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] text-slate-400 uppercase">Tarif Expédition Calculé</p>
                  <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                    {fraisCalcules.toLocaleString()} FCFA
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {poids} kg × 500 F
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition transform hover:-translate-y-0.5"
              >
                <CheckCircle2 size={16} className="stroke-[2.5]" />
                <span>Enregistrer & Générer Bordereau ({fraisCalcules.toLocaleString()} F)</span>
              </button>
            </form>
          </div>

          {/* Bordereau Imprimable */}
          {colisImprime && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wide">
                  <CheckCircle2 size={16} />
                  <span>Bordereau Colis Prêt</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer size={14} />
                  <span>Imprimer</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-800">
                  <span className="font-black text-white text-sm">{colisImprime.codeSuivi}</span>
                  <span className="text-emerald-400 font-bold">{colisImprime.fraisXaf.toLocaleString()} FCFA</span>
                </div>
                <p className="text-slate-300">Exp : <strong>{colisImprime.expediteur}</strong> ({colisImprime.telExp})</p>
                <p className="text-slate-300">Dest : <strong>{colisImprime.destinataire}</strong> ({colisImprime.telDest})</p>
                <p className="text-slate-400">{colisImprime.nature} · <span className="text-white font-bold">{colisImprime.poidsKg} kg</span></p>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            COLONNE DROITE (7/12) : LISTE & SUIVI DES EXPÉDITIONS
           ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider">
                Expéditions Récentes & Colis en Transit ({filteredColis.length})
              </h2>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Rechercher code, nom..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-400 outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredColis.map((c) => (
                <div 
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {c.codeSuivi}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        c.statut === 'EN_TRANSIT' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 animate-pulse' :
                        c.statut === 'RECU_DESTINATION' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {c.statut.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500">{c.dateEnvoi}</span>
                    </div>

                    <p className="text-xs text-slate-300">
                      De : <strong className="text-white">{c.expediteur}</strong> ➔ À : <strong className="text-white">{c.destinataire}</strong> ({c.telDest})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {c.nature} · Poids : <strong className="text-white">{c.poidsKg} kg</strong> · Valeur : {c.valeurXaf?.toLocaleString()} F
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className="text-base font-black text-emerald-400 font-mono">
                      {c.fraisXaf.toLocaleString()} FCFA
                    </span>
                    <button
                      onClick={() => {
                        setColisImprime(c)
                        toast.success(`Bordereau ${c.codeSuivi} chargé pour impression.`)
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition"
                    >
                      <QrCode size={13} className="text-amber-400" />
                      <span>Bordereau</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
