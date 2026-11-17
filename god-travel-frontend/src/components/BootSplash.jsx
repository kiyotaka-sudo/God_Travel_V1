import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'

export default function BootSplash() {
  const [progress, setProgress] = useState(8)

  useEffect(() => {
    const start = performance.now()
    let frame
    const tick = (now) => {
      const elapsed = now - start
      setProgress(Math.min(94, 8 + elapsed / 13))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <main className="boot-screen" aria-label="Chargement de God Travel">
      <div className="boot-topline"><span>GOD TRAVEL</span><span>CAMEROUN · 2026</span></div>
      <div className="boot-center">
        <div className="boot-brand"><img src="/god-travel-logo.jpg" alt="" /><span>Le voyage commence ici.</span></div>
        <div className="boot-road" aria-hidden="true">
          <div className="boot-road-line" />
          <div className="boot-bus">GT<ArrowUpRight size={16} strokeWidth={2.5} /></div>
        </div>
        <div className="boot-progress-row"><span>Préparation de votre départ</span><span>{Math.round(progress)}%</span></div>
        <div className="boot-progress"><span style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="boot-bottomline"><span>YAOUNDÉ</span><span className="boot-route-mark">N3</span><span>DOUALA</span></div>
    </main>
  )
}
