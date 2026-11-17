// Bus3D.jsx
// Composant React du bus God-travel (React Three Fiber).
//
// Installation :
//   npm install three @react-three/fiber @react-three/drei
//
// Utilisation (le conteneur doit avoir une hauteur) :
//   import BusScene from './Bus3D';
//
//   <div style={{ height: 480 }}>
//     <BusScene speed={5} />
//   </div>
//
// Props de BusScene :
//   colors      { accent, body, glass, dark, road, text }  (toutes optionnelles)
//   speed       vitesse de rotation des roues en rad/s, 0 pour les arrêter (5 par défaut)
//   road        affiche la route qui défile (true par défaut)
//   autoRotate  la caméra tourne lentement autour du bus (true par défaut)
//   zoom        autorise le zoom à la molette ou au pincement (false par défaut)
//
// Pour utiliser seulement le bus dans votre propre <Canvas>, importez { Bus }.

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  WHEEL_RADIUS,
  createBus,
  createRoad,
  disposeObject,
  fovForAspect,
  setupStudio,
} from './createBus';

export function Bus({ colors, speed = 5, road = true, scrollProgress, ...groupProps }) {
  const key = JSON.stringify(colors ?? {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bus = useMemo(() => createBus(colors), [key]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const roadObject = useMemo(() => createRoad(colors), [key]);
  const distance = useRef(0);

  useEffect(() => () => disposeObject(bus.group), [bus]);
  useEffect(() => () => disposeObject(roadObject.group), [roadObject]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (scrollProgress == null) {
      for (const wheel of bus.wheels) wheel.rotation.z -= speed * dt;
      distance.current += speed * WHEEL_RADIUS * dt;
    } else {
      const progress = Math.max(0, Math.min(1, scrollProgress));
      for (const wheel of bus.wheels) wheel.rotation.z = -progress * 34;
      distance.current = progress * 120;
      bus.group.position.x = Math.sin(progress * Math.PI * 2) * 0.34;
      bus.group.rotation.y = Math.sin(progress * Math.PI) * 0.13;
    }
    roadObject.update(distance.current);
  });

  return (
    <group {...groupProps}>
      {road && <primitive object={roadObject.group} />}
      <primitive object={bus.group} />
    </group>
  );
}

function Studio() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  useEffect(() => setupStudio(gl, scene), [gl, scene]);
  return null;
}

function FitCamera() {
  const camera = useThree((state) => state.camera);
  const aspect = useThree((state) => state.size.width / state.size.height);
  useEffect(() => {
    camera.fov = fovForAspect(aspect);
    camera.updateProjectionMatrix();
  }, [camera, aspect]);
  return null;
}

// Laisse défiler la page verticalement quand on touche le bus sur téléphone.
function TouchScroll() {
  const dom = useThree((state) => state.gl.domElement);
  useEffect(() => {
    dom.style.touchAction = 'pan-y';
  }, [dom]);
  return null;
}

export default function BusScene({
  colors,
  speed = 5,
  road = true,
  autoRotate = true,
  zoom = false,
  scrollProgress,
  className,
  style,
}) {
  return (
    <Canvas
      className={className}
      style={style}
      flat
      dpr={[1, 2]}
      camera={{ position: [9.8, 4, 8.8], fov: 34, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Studio />
      <FitCamera />
      <Bus colors={colors} speed={speed} road={road} scrollProgress={scrollProgress} />
      <OrbitControls
        target={[0, 1.5, 0]}
        enablePan={false}
        enableZoom={zoom}
        enableDamping
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
        minDistance={9}
        maxDistance={30}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2 - 0.04}
      />
      <TouchScroll />
    </Canvas>
  );
}
