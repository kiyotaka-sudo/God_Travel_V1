import React, { useState } from 'react'
import { 
  Wallet, ArrowDownRight, ArrowUpRight, Lock, Unlock, 
  FileText, CheckCircle2, AlertTriangle, Shield, Clock, DollarSign, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CaissePage() {
  const [sessionOuverte, setSessionOuverte] = useState(true)
  const [fondCaisse, setFondCaisse] = useState(50000)
  const [recettesBillets, setRecettesBillets] = useState(320000)
  const [recettesColis, setRecettesColis] = useState(64000)
  const [depenses, setDepenses] = useState(4500)
  const [especesComptees, setEspecesComptees] = useState(429500)
  const [showModalCloture, setShowModalCloture] = useState(false)

  const montantTheorique = fondCaisse + recettesBillets + recettesColis - depenses
  const ecartConstate = especesComptees - montantTheorique

  const transactions = [
    { id: 1, heure: '08:12', ref: 'ENC-0091', type: 'BILLETTERIE', libelle: 'Billet GT-TKT-10492 · Yaoundé ➔ Douala (VIP)', montant: 6000, mode: 'MONETBIL' },
    { id: 2, heure: '08:45', ref: 'ENC-0092', type: 'COLIS', libelle: 'Colis GT-COL-7821 (14.5 kg) · Alain FOTSO', montant: 7500, mode: 'ESPECES' },
    { id: 3, heure: '09:30', ref: 'ENC-0093', type: 'BILLETTERIE', libelle: '2 Billets VIP GT-TKT-10495/96 · Famille MBIA', montant: 12000, mode: 'MONETBIL' },
    { id: 4, heure: '10:15', ref: 'DEC-0004', type: 'DEPENSE', libelle: 'Achat rouleaux papier thermique pour guichet', montant: -4500, mode: 'ESPECES' },
    { id: 5, heure: '11:00', ref: 'ENC-0094', type: 'BILLETTERIE', libelle: 'Billet Standard GT-TKT-10501 · Paul BIYONG', montant: 4000, mode: 'ESPECES' },
  ]

  const handleConfirmerCloture = () => {
    setSessionOuverte(false)
    setShowModalCloture(false)
    toast.success('Session de caisse clôturée et rapport transmis au Chef d\'Agence !')
  }

  const handleReouvrir = () => {
    setSessionOuverte(true)
    toast.success('Nouvelle session de caisse ouverte pour le guichet.')
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Wallet size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Gestion de Caisse & Rapprochement Journalier
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Session guichet <strong className="text-white">SC-2026-11-17</strong> · Rapprochement théorique vs physique conforme au cours de SGBD (Procédure <code className="text-purple-300">SP_CLOTURER_SESSION_CAISSE</code>)
          </p>
        </div>

        <div>
          {sessionOuverte ? (
            <button
              onClick={() => setShowModalCloture(true)}
              className="px-4 py-2.5 rounded-2xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 font-bold text-xs flex items-center gap-2 transition shadow-lg"
            >
              <Lock size={15} />
              <span>Clôturer la Caisse</span>
            </button>
          ) : (
            <button
              onClick={handleReouvrir}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-2 transition shadow-lg"
            >
              <Unlock size={15} />
              <span>Ouvrir une Nouvelle Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Cartes Métriques Financières */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Fond Initial */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <p className="text-[10px] font-mono uppercase font-black text-slate-400">Fond Initial de Caisse</p>
          <p className="text-2xl font-black text-white font-mono mt-1">
            {fondCaisse.toLocaleString()} F
          </p>
          <p className="text-[10px] text-slate-500">Alloué à l'ouverture (06:30)</p>
        </div>

        {/* Recettes Billetterie */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <p className="text-[10px] font-mono uppercase font-black text-slate-400">Recettes Billetterie</p>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">
            +{recettesBillets.toLocaleString()} F
          </p>
          <p className="text-[10px] text-amber-400/80">Monetbil & Espèces</p>
        </div>

        {/* Recettes Colis */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
          <p className="text-[10px] font-mono uppercase font-black text-slate-400">Recettes Fret & Colis</p>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">
            +{recettesColis.toLocaleString()} F
          </p>
          <p className="text-[10px] text-emerald-400/80">Pesée au kilo</p>
        </div>

        {/* Solde Théorique Total */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-primary-950/60 to-slate-900 border border-amber-400/40 shadow-xl space-y-1">
          <p className="text-[10px] font-mono uppercase font-black text-amber-300">Solde Théorique Attendu</p>
          <p className="text-2xl font-black text-white font-mono mt-1">
            {montantTheorique.toLocaleString()} FCFA
          </p>
          <p className="text-[10px] text-slate-400">Dépenses déduites : -{depenses.toLocaleString()} F</p>
        </div>
      </div>

      {/* Journal des Transactions Guichet */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider">
            Journal d'Audit des Encaissements & Décaissements
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {transactions.length} opérations enregistrées
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {transactions.map((t) => (
            <div key={t.id} className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-800/40 px-3 -mx-3 rounded-xl transition">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                  t.montant > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {t.montant > 0 ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-white">{t.ref}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{t.heure}</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {t.mode}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{t.libelle}</p>
                </div>
              </div>

              <div className="text-right">
                <span className={`font-black font-mono text-sm ${
                  t.montant > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {t.montant > 0 ? `+${t.montant.toLocaleString()}` : t.montant.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE CLÔTURE DE CAISSE AVEC CALCUL D'ÉCART */}
      {showModalCloture && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Lock size={18} className="text-amber-400" />
                <span>Clôture Définitive de la Session de Caisse</span>
              </h3>
              <button 
                onClick={() => setShowModalCloture(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Montant Théorique Calculé :</span>
                <span className="font-mono font-bold text-white">{montantTheorique.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Espèces Physiques Comptées :</span>
                <span className="font-mono font-bold text-amber-400">{especesComptees.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                <span className="text-slate-300">Écart Constaté :</span>
                <span className={`font-mono ${ecartConstate === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {ecartConstate === 0 ? '0 FCFA (ÉQUILIBRÉ ✓)' : `${ecartConstate.toLocaleString()} FCFA`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Saisir le montant physique compté en caisse (FCFA)
              </label>
              <input
                type="number"
                value={especesComptees}
                onChange={(e) => setEspecesComptees(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold focus:border-amber-400 outline-none text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowModalCloture(false)}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmerCloture}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg transition"
              >
                Confirmer la Clôture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
