import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ArrowRight, Check, QrCode, Route } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const ScrollScene = lazy(() => import('./ScrollScene'))
const scenes = [
  { name: 'Le départ', title: 'La route commence à Yaoundé.', body: 'Du départ en agence à l’arrivée à Douala, retrouvez les informations utiles à chaque étape du voyage.', label: 'YAOUNDÉ · DÉPART' },
  { name: 'Le trajet', title: 'Un même itinéraire, chaque jour.', body: 'Consultez les départs publiés par l’agence et choisissez celui qui correspond à votre journée.', label: 'YAOUNDÉ — DOUALA' },
  { name: 'Le suivi', title: 'Votre voyage, mieux préparé.', body: 'Les positions disponibles sont consultables dans l’espace flotte. Cette présentation ne simule pas de position en temps réel.', label: 'INFORMATIONS DE VOYAGE' },
  { name: 'Votre place', title: 'Choisissez votre siège.', body: 'Sélectionnez une place libre depuis le plan du départ choisi. Sa disponibilité est vérifiée de nouveau par le serveur.', label: 'PLAN DU BUS' },
  { name: 'Le billet', title: 'Votre billet suit votre voyage.', body: 'Après confirmation du paiement par Monetbil, retrouvez le billet et son QR dans votre espace ou via la page de consultation.', label: 'QR · BILLET NOMINATIF' },
  { name: 'L’arrivée', title: 'Explorez. Arrivez.', body: 'Préparez votre prochain déplacement entre les deux villes.', label: 'DOUALA · ARRIVÉE' },
]

function StaticBus() {
  return <div className="journey-static-bus" role="img" aria-label="Illustration d’un autocar God Travel"><div className="static-bus-windows" /><div className="static-bus-band">GOD TRAVEL</div><i /><i /></div>
}

function SceneLoading() {
  return <div className="journey-scene-fallback"><img src="/god-travel-logo.jpg" alt="" /><span>Préparation du voyage…</span><i /></div>
}

export default function ScrollJourney() {
  const stage = useRef(null)
  const progressRef = useRef({ value: 0 })
  const invalidateScene = useRef(null)
  const progressBar = useRef(null)
  const crossfade = useRef(null)
  const [current, setCurrent] = useState(0)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [webgl, setWebgl] = useState(true)
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const checkMotion = () => setReduced(motion.matches)
    checkMotion()
    motion.addEventListener?.('change', checkMotion)
    try {
      const canvas = document.createElement('canvas')
      setWebgl(Boolean(canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true }) || canvas.getContext('webgl', { failIfMajorPerformanceCaveat: true })))
    } catch { setWebgl(false) }
    return () => motion.removeEventListener?.('change', checkMotion)
  }, [])

  const staticMode = reduced || !webgl
  useEffect(() => {
    if (!stage.current || staticMode) return undefined
    gsap.registerPlugin(ScrollTrigger)
    progressRef.current.value = 0
    setSceneReady(false)
    const context = gsap.context(() => {
      gsap.to(progressRef.current, {
        value: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: stage.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.25,
          onUpdate: (trigger) => {
            const next = Math.min(scenes.length - 1, Math.floor(trigger.progress * scenes.length))
            setCurrent((previous) => previous === next ? previous : next)
            if (progressBar.current) progressBar.current.style.transform = `scaleY(${trigger.progress})`
            if (crossfade.current) crossfade.current.style.opacity = String(Math.max(0, Math.min(1, (trigger.progress - 0.9) * 10)))
            invalidateScene.current?.()
          },
        },
      })
    }, stage)
    ScrollTrigger.refresh()
    return () => context.revert()
  }, [staticMode])

  return <section id="voyage" ref={stage} className={`journey ${staticMode ? 'is-static' : ''}`} aria-label="Voyage immersif God Travel">
    <div className="journey-sticky-art">
      <div className="journey-art-head"><span>GOD TRAVEL · N3</span><span>{scenes[current].label}</span></div>
      <div className="journey-canvas" aria-hidden="true">{staticMode ? <StaticBus /> : <><Suspense fallback={<SceneLoading />}><ScrollScene progressRef={progressRef} onReady={(invalidate) => { invalidateScene.current = invalidate; invalidate?.(); setSceneReady(true) }} /></Suspense>{!sceneReady && <SceneLoading />}</>}</div>
      <div className="journey-vertical-label"><span>{String(current + 1).padStart(2, '0')}</span> / 06 · {scenes[current].name}</div>
      {!staticMode && <div className="journey-progress" aria-hidden="true"><span ref={progressBar} /></div>}
      <div ref={crossfade} className="journey-crossfade" aria-hidden="true" />
    </div>
    <div className="journey-stories">{scenes.map((scene, index) => <article className="journey-story" key={scene.name} aria-label={`${index + 1} sur ${scenes.length} : ${scene.name}`} aria-current={current === index ? 'step' : undefined}><div className="story-topline"><span>{scene.name.toUpperCase()}</span><span className="story-time">{String(index + 1).padStart(2, '0')} / 06</span></div><h2>{scene.title}</h2><p>{scene.body}</p>{index === 3 ? <Link className="button-primary" to="/reserver">Choisir un départ <ArrowRight size={16} /></Link> : index === 4 ? <Link className="story-inline-link" to="/billet"><QrCode size={15} /> Retrouver un billet</Link> : <div className="story-location"><Route size={14} /> {scene.label}</div>}{current === index && <span className="journey-active-mark" aria-hidden="true"><Check size={12} /></span>}</article>)}</div>
    <a className="journey-scroll-cue" href="#reserver"><ArrowDown size={15} /> DÉFILER POUR DÉCOUVRIR</a>
  </section>
}
