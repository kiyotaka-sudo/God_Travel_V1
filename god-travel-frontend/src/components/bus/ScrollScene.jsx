import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Bus } from './BusMesh'

function Cabin() {
  const seats = useMemo(() => Array.from({ length: 7 }, (_, row) => [-0.72, -0.34, 0.34, 0.72].map((z) => ({ x: 2.5 - row * 0.86, z, key: `${row}-${z}` })).flat()).flat(), [])
  return <group>
    <mesh position={[-0.2, 0.83, 0]}><boxGeometry args={[7.2, 0.08, 2.12]} /><meshStandardMaterial color="#26363a" /></mesh>
    <mesh position={[-0.2, 1.45, -1.02]}><boxGeometry args={[7.1, 1.1, 0.06]} /><meshStandardMaterial color="#b6dfe0" transparent opacity={0.28} /></mesh>
    <mesh position={[-0.2, 1.45, 1.02]}><boxGeometry args={[7.1, 1.1, 0.06]} /><meshStandardMaterial color="#b6dfe0" transparent opacity={0.28} /></mesh>
    {seats.map((seat) => <group key={seat.key} position={[seat.x, 0.92, seat.z]}>
      <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.38, 0.18, 0.31]} /><meshStandardMaterial color="#edf4f3" /></mesh>
      <mesh position={[-0.1, 0.4, 0]}><boxGeometry args={[0.14, 0.54, 0.31]} /><meshStandardMaterial color="#e5efee" /></mesh>
      <mesh position={[-0.16, 0.68, 0]}><boxGeometry args={[0.06, 0.12, 0.29]} /><meshStandardMaterial color="#14b2b6" /></mesh>
    </group>)}
    <mesh position={[3.55, 1.16, 0]} rotation={[0, 0, -0.18]}><boxGeometry args={[0.55, 0.52, 1.9]} /><meshStandardMaterial color="#17282c" /></mesh>
    <mesh position={[3.15, 1.45, 0.58]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.22, 0.025, 8, 24]} /><meshStandardMaterial color="#14b2b6" /></mesh>
    <pointLight position={[0, 2.4, 0]} intensity={1.2} color="#d7ffff" distance={9} />
  </group>
}

function ScrollCamera({ progressRef }) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const pointCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(10, 4, 10), new THREE.Vector3(0, 3.3, 13), new THREE.Vector3(-8, 2.7, 6),
    new THREE.Vector3(9, 2.5, 0), new THREE.Vector3(3.5, 2.2, 1.8), new THREE.Vector3(0.2, 1.7, 0.1),
    new THREE.Vector3(-2.8, 1.7, 0.05), new THREE.Vector3(-4, 2.2, 2), new THREE.Vector3(10, 4, 10),
  ]), [])
  const targetCurve = useMemo(() => new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.35, 0), new THREE.Vector3(0, 1.35, 0), new THREE.Vector3(0, 1.35, 0),
    new THREE.Vector3(1.5, 1.5, 0), new THREE.Vector3(3.5, 1.7, 0), new THREE.Vector3(4, 1.55, 0),
    new THREE.Vector3(3.8, 1.5, 0), new THREE.Vector3(1, 1.45, 0), new THREE.Vector3(0, 1.35, 0),
  ]), [])
  const desired = useRef(new THREE.Vector3())
  const target = useRef(new THREE.Vector3())
  useEffect(() => {
    camera.fov = size.width / size.height < 0.8 ? 56 : 38
    camera.updateProjectionMatrix()
  }, [camera, size.width, size.height])
  useFrame(() => {
    const t = THREE.MathUtils.clamp(progressRef.current.value, 0, 1)
    pointCurve.getPointAt(t, desired.current)
    targetCurve.getPointAt(t, target.current)
    camera.position.copy(desired.current)
    camera.lookAt(target.current)
  })
  return null
}

function ScrollWorld({ progressRef }) {
  const exterior = useRef(null)
  const interior = useRef(null)
  useFrame(() => {
    const progress = progressRef.current.value
    const inside = progress > 0.52 && progress < 0.9
    if (exterior.current) exterior.current.visible = !inside
    if (interior.current) interior.current.visible = inside
  })
  return <>
    <ambientLight intensity={0.9} /><directionalLight position={[5, 9, 6]} intensity={2.2} /><hemisphereLight args={['#d7ffff', '#143036', 1.1]} />
    <group ref={exterior}><Bus speed={3} scrollProgressRef={progressRef} /></group>
    <group ref={interior}><Cabin /></group>
    <ScrollCamera progressRef={progressRef} />
  </>
}

export default function ScrollScene({ progressRef, onReady }) {
  return <Canvas frameloop="demand" onCreated={(state) => onReady?.(state.invalidate)} fallback={<div className="journey-scene-fallback">Le voyage se poursuit à travers les étapes ci-dessous.</div>} dpr={[1, 1.6]} camera={{ position: [10, 4, 10], fov: 38 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}>
    <ScrollWorld progressRef={progressRef} />
  </Canvas>
}
