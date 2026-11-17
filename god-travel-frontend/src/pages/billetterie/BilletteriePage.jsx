import React, { useState, useEffect } from 'react'
import {
  Ticket, Search, User, CreditCard, CheckCircle2, Smartphone,
  AlertCircle, Clock, MapPin, BusFront, ArrowRight, Printer,
  Shield, QrCode, Lock, Check, Sparkles, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import axios from '@api/axios'

export default function BilletteriePage() {
  const [voyages, setVoyages] = useState([
    {
      id: 1,
      idVoyage: 'VOY-001',
      codeVoyage: 'VOY-YDE-DLA-07H30',
      depart: 'Yaoundé (Gare Mvan)',
      arrivee: 'Douala (Gare Bépanda)',
      heure: '07:30',
      classe: 'VIP Climatise',
      bus: 'LT-542-AA (Yutong Luxury 70p)',
      placesTotal: 70,
      placesDispo: 22,
      tarif: 6000,
      occupiedSeats: [1, 2, 3, 4, 7, 8, 9, 10, 11, 15, 16, 17, 18, 21, 22, 23, 25, 26, 30, 31, 35, 36],
      statut: 'EN_ROUTE',
    },
    {
      id: 2,
      idVoyage: 'VOY-002',
      codeVoyage: 'VOY-YDE-DLA-09H00',
      depart: 'Yaoundé (Gare Mvan)',
      arrivee: 'Douala (Gare Bépanda)',
      heure: '09:00',
      classe: 'Standard Grand Confort',
      bus: 'CE-892-BC (Toyota Coaster 50p)',
      placesTotal: 50,
      placesDispo: 18,
      tarif: 4000,
      occupiedSeats: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28],
      statut: 'EMBARQUEMENT',
    },
    {
      id: 3,
      idVoyage: 'VOY-003',
      codeVoyage: 'VOY-DLA-YDE-11H00',
      depart: 'Douala (Gare Bépanda)',
      arrivee: 'Yaoundé (Gare Mvan)',
      heure: '11:00',
      classe: 'VIP Climatise',
      bus: 'LT-441-AA (Marcopolo Paradiso 70p)',
      placesTotal: 70,
      placesDispo: 38,
      tarif: 6000,
      occupiedSeats: [1, 2, 5, 6, 11, 12, 19, 20],
      statut: 'OUVERT',
    },
  ])

  const [selectedVoyage, setSelectedVoyage] = useState(voyages[0])
  const [selectedSiege, setSelectedSiege] = useState(13)
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [cni, setCni] = useState('')
  const [modePaiement, setModePaiement] = useState('MONETBIL') // 'MONETBIL' | 'ESPECES'
  const [operateur, setOperateur] = useState('CM_MTNMOBILEMONEY')
  const [loading, setLoading] = useState(false)
  const [ticketGenere, setTicketGenere] = useState(null)

  // Nombre de sièges selon la capacité du bus sélectionné
  const totalSeats = selectedVoyage?.placesTotal || 50
  const occupiedSet = new Set(selectedVoyage?.occupiedSeats || [])

  const handleSelectVoyage = (v) => {
    setSelectedVoyage(v)
    setTicketGenere(null)
    // Trouver le premier siège libre
    for (let i = 1; i <= v.placesTotal; i++) {
      if (!v.occupiedSeats.includes(i)) {
        setSelectedSiege(i)
        break
      }
    }
  }

  const handleReserver = async (e) => {
    e.preventDefault()
    if (!nom.trim() || !telephone.trim()) {
      toast.error('Veuillez renseigner le nom et le numéro de téléphone.')
      return
    }

    if (occupiedSet.has(selectedSiege)) {
      toast.error('Ce siège est déjà occupé ! Veuillez en choisir un autre.')
      return
    }

    setLoading(true)
    try {
      // Simulation appel backend ou direct
      await axios.post('/paiements/monetbil/initier', {
        amount: selectedVoyage.tarif,
        phone: telephone,
        operator: operateur,
        typeReference: 'BILLET',
        idReference: selectedVoyage.idVoyage,
      }).catch(() => null)

      const refTicket = 'GT-TKT-' + Math.floor(100000 + Math.random() * 900000)
      const refReservation = 'RES-' + Math.floor(10000 + Math.random() * 90000)

      const nouveauTicket = {
        refBillet: refTicket,
        refReservation: refReservation,
        passager: nom.toUpperCase(),
        telephone: telephone,
        cni: cni || 'NON RENSEIGNÉE',
        voyage: selectedVoyage,
        siege: selectedSiege,
        montant: selectedVoyage.tarif,
        mode: modePaiement,
        dateEmission: new Date().toLocaleString('fr-FR'),
      }

      setTicketGenere(nouveauTicket)
      toast.success(`Billet ${refTicket} émis avec succès !`)
    } catch (err) {
      toast.error('Erreur lors de l\'émission du billet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Ticket size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Guichet & Émission de Billets Express
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ligne interurbaine <strong className="text-white">Yaoundé Mvan ⇄ Douala Bépanda</strong> · Attribution dynamique des sièges & Paiement Mobile Money
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono">
            Session Caisse : <strong className="text-amber-400">SC-2026-YDE</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ========================================================
            COLONNE GAUCHE (7/12) : DÉPARTS & PLAN DU BUS 2D
           ======================================================== */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. Sélection du Départ */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
            <h2 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>1. Choisir le Voyage & la Classe</span>
              <span className="text-amber-400">{voyages.length} départs disponibles</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {voyages.map((v) => {
                const isSelected = selectedVoyage?.id === v.id
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSelectVoyage(v)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${isSelected
                        ? 'bg-gradient-to-br from-slate-900 to-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-400'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono font-black text-base text-white">{v.heure}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${v.classe.includes('VIP') ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-blue-400/20 text-blue-300'
                          }`}>
                          {v.classe.includes('VIP') ? 'VIP' : 'STD'}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-300 truncate">
                        {v.depart.split(' ')[0]} ➔ {v.arrivee.split(' ')[0]}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{v.bus.split(' ')[0]}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {v.tarif.toLocaleString()} F
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400">
                        {v.placesDispo} libres
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. PLAN DE BUS 2D INTERACTIF DE L'AUTOCAR */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-mono font-black uppercase text-slate-400 tracking-wider">
                  2. Plan de Sièges de l'Autocar ({selectedVoyage.bus})
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Cliquez sur un fauteuil libre pour l'attribuer au passager.
                </p>
              </div>

              {/* Légende */}
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50" />
                  <span className="text-slate-300">Libre</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-400 border border-amber-300 shadow-[0_0_8px_#F59E0B]" />
                  <span className="text-amber-400 font-black">Sélectionné ({selectedSiege})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 text-slate-600" />
                  <span className="text-slate-500">Occupé</span>
                </div>
              </div>
            </div>

            {/* Châssis de l'Autocar 2D */}
            <div className="relative p-5 rounded-2xl bg-slate-950 border-2 border-slate-800/80 overflow-x-auto shadow-inner">

              {/* Avant du Bus (Cockpit Chauffeur & Entrée) */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 font-mono text-[10px]">
                    🛞
                  </div>
                  <span>Poste Conducteur</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                  <span>🚪 PORTE AVANT</span>
                </div>
              </div>

              {/* Grille des Sièges (Rangées de 4 avec allée centrale : 2 + Couloir + 2) */}
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {Array.from({ length: totalSeats }).map((_, i) => {
                  const seatNum = i + 1
                  const isOccupied = occupiedSet.has(seatNum)
                  const isSelected = selectedSiege === seatNum

                  return (
                    <button
                      key={seatNum}
                      type="button"
                      disabled={isOccupied}
                      onClick={() => setSelectedSiege(seatNum)}
                      title={isOccupied ? `Siège ${seatNum} (Occupé)` : `Siège ${seatNum} (Disponible)`}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center font-mono text-xs font-bold transition transform ${isSelected
                          ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105 z-10'
                          : isOccupied
                            ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-60'
                            : 'bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-emerald-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                    >
                      <span className="text-[10px] opacity-70">N°</span>
                      <span>{seatNum}</span>
                    </button>
                  )
                })}
              </div>

              {/* Fond du Bus */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-[10px] text-slate-500 font-mono">
                <span>BANQUETTE ARRIÈRE VIP</span>
                <span>ISSUE DE SECOURS 🚨</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            COLONNE DROITE (5/12) : FORMULAIRE D'ENCAISSEMENT & TICKET
           ======================================================== */}
        <div className="lg:col-span-5 space-y-6">

          {/* Formulaire d'encaissement */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-black text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span>3. Informations & Encaissement</span>
              </h2>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Siège N° {selectedSiege}
              </span>
            </div>

            {/* Récapitulatif Trajet */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white">{selectedVoyage.depart} ➔ {selectedVoyage.arrivee}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Départ : {selectedVoyage.heure} · {selectedVoyage.classe}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-amber-400 font-mono">
                  {selectedVoyage.tarif.toLocaleString()} F
                </span>
                <p className="text-[10px] text-slate-500">TTC</p>
              </div>
            </div>

            <form onSubmit={handleReserver} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Nom et Prénom du Passager *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PAUL BIYONG"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Téléphone (MoMo) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 699001122"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    N° CNI (Facultatif)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 109283746"
                    value={cni}
                    onChange={(e) => setCni(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition"
                  />
                </div>
              </div>

              {/* Mode de Règlement */}
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Mode de Paiement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModePaiement('MONETBIL')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${modePaiement === 'MONETBIL'
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                  >
                    <Smartphone size={16} className={modePaiement === 'MONETBIL' ? 'text-amber-400' : ''} />
                    <div className="leading-tight">
                      <p className="font-bold text-[11px]">Monetbil</p>
                      <p className="text-[9px] opacity-70">MTN / Orange Money</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModePaiement('ESPECES')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition ${modePaiement === 'ESPECES'
                        ? 'bg-emerald-400/10 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                  >
                    <CreditCard size={16} className={modePaiement === 'ESPECES' ? 'text-emerald-400' : ''} />
                    <div className="leading-tight">
                      <p className="font-bold text-[11px]">Espèces Guichet</p>
                      <p className="text-[9px] opacity-70">Encaissé en caisse</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Opérateur si Monetbil */}
              {modePaiement === 'MONETBIL' && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Sélectionner l'Opérateur Réseau :</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOperateur('CM_MTNMOBILEMONEY')}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-bold ${operateur === 'CM_MTNMOBILEMONEY'
                          ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300'
                          : 'border-slate-800 text-slate-500'
                        }`}
                    >
                      🟡 MTN MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperateur('CM_ORANGEMONEY')}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-bold ${operateur === 'CM_ORANGEMONEY'
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                          : 'border-slate-800 text-slate-500'
                        }`}
                    >
                      🟠 Orange Money
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.4)] transition transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Transaction sécurisée en cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="stroke-[2.5]" />
                    <span>Valider & Encaisser ({selectedVoyage.tarif.toLocaleString()} FCFA)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ========================================================
              BILLET IMPRIMABLE RÉALISTE AVEC QR CODE
             ======================================================== */}
          {ticketGenere && (
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-emerald-500/40 shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wide">
                  <CheckCircle2 size={16} />
                  <span>Billet Émis avec Succès</span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer size={14} />
                  <span>Imprimer Billet</span>
                </button>
              </div>

              {/* Format Ticket Thermique d'Agence */}
              <div id="billet-print" className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-3">
                <div className="text-center border-b border-dashed border-slate-800 pb-3">
                  <p className="font-black text-base text-white tracking-widest">UNITED EXPRESS S.A.</p>
                  <p className="text-[10px] text-amber-400 font-bold">GOD TRAVEL · BILLET DE TRANSPORT</p>
                  <p className="text-[9px] text-slate-500">Ligne : Yaoundé Mvan ⇄ Douala Bépanda</p>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">RÉFÉRENCE :</span>
                    <span className="font-bold text-amber-400">{ticketGenere.refBillet}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PASSAGER :</span>
                    <span className="font-bold text-white">{ticketGenere.passager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SIÈGE ATTRIBUÉ :</span>
                    <span className="font-black text-emerald-400 text-sm">N° {ticketGenere.siege}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DÉPART :</span>
                    <span className="font-bold text-white">{ticketGenere.voyage.heure} ({ticketGenere.voyage.classe})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MONTANT PAYÉ :</span>
                    <span className="font-bold text-white">{ticketGenere.montant.toLocaleString()} FCFA ({ticketGenere.mode})</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-dashed border-slate-800 flex items-center justify-between">
                  <div className="w-16 h-16 rounded-lg bg-white p-1 flex items-center justify-center">
                    <QrCode size={52} className="text-slate-950" />
                  </div>
                  <div className="text-right text-[9px] text-slate-500 space-y-0.5">
                    <p className="text-slate-400 font-bold">SCAN EMBARQUEMENT</p>
                    <p>À présenter à l'hôtesse</p>
                    <p className="text-emerald-500 font-bold">Assurance CEMAC Incluse</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
