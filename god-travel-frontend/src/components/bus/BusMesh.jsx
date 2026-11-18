import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { WHEEL_RADIUS, createBus, createRoad, disposeObject } from './createBus'

export function Bus({ colors, speed = 5, road = true, scrollProgress, scrollProgressRef, ...groupProps }) {
  const key = JSON.stringify(colors ?? {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bus = useMemo(() => createBus(colors), [key])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const roadObject = useMemo(() => createRoad(colors), [key])
  const distance = useRef(0)

  useEffect(() => () => disposeObject(bus.group), [bus])
  useEffect(() => () => disposeObject(roadObject.group), [roadObject])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const progressValue = scrollProgressRef?.current?.value ?? scrollProgress
    if (progressValue == null) {
      for (const wheel of bus.wheels) wheel.rotation.z -= speed * dt
      distance.current += speed * WHEEL_RADIUS * dt
    } else {
      const progress = Math.max(0, Math.min(1, progressValue))
      for (const wheel of bus.wheels) wheel.rotation.z = -progress * 34
      distance.current = progress * 120
      bus.group.position.x = Math.sin(progress * Math.PI * 2) * 0.34
      bus.group.rotation.y = Math.sin(progress * Math.PI) * 0.13
    }
    roadObject.update(distance.current)
  })

  return <group {...groupProps}>{road && <primitive object={roadObject.group} />}<primitive object={bus.group} /></group>
}
