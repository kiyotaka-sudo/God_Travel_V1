import { ArrowUpRight } from 'lucide-react'

export default function BootSplash() {
  return (
    <main className="boot-screen" aria-label="Chargement de God Travel">
      <div className="boot-topline"><span>GOD TRAVEL</span><span>CAMEROUN · 2026</span></div>
      <div className="boot-center">
        <div className="boot-brand"><img src="/god-travel-logo.jpg" alt="" /><span>Le voyage commence ici.</span></div>
        <div className="boot-road" aria-hidden="true">
          <div className="boot-road-line" />
          <div className="boot-bus">GT<ArrowUpRight size={16} strokeWidth={2.5} /></div>
        </div>
        <div className="boot-progress-row"><span>Préparation de votre espace</span><span>GOD TRAVEL</span></div>
        <div className="boot-progress" role="progressbar" aria-label="Chargement de l’application"><span /></div>
      </div>
      <div className="boot-bottomline"><span>YAOUNDÉ</span><span className="boot-route-mark">N3</span><span>DOUALA</span></div>
    </main>
  )
}
