import { useCallback, useEffect, useRef, useState } from 'react'
import { siegeApi } from '@api/index'

const dataOf = (response) => response?.data?.data

export function useSeatLock(onExpired) {
  const [lock, setLock] = useState(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const lockRef = useRef(null)
  const requestRef = useRef(0)
  const mountedRef = useRef(false)
  const onExpiredRef = useRef(onExpired)

  useEffect(() => { onExpiredRef.current = onExpired }, [onExpired])

  const release = useCallback(async (target = lockRef.current, silent = true) => {
    if (!target) return true
    try {
      await siegeApi.liberer(target.idVoyage, target.numSiege)
      if (lockRef.current === target) {
        lockRef.current = null
        if (mountedRef.current) {
          setLock(null)
          setRemainingSeconds(0)
        }
      }
      return true
    } catch (error) {
      if (!silent) throw error
      return false
    }
  }, [])

  const select = useCallback(async (idVoyage, numSiege) => {
    const requestId = ++requestRef.current
    const current = lockRef.current
    if (current && current.idVoyage === idVoyage && Number(current.numSiege) === Number(numSiege)) {
      await release(current, false)
      return null
    }
    if (current) await release(current, false)
    if (requestId !== requestRef.current || !mountedRef.current) return null

    const response = dataOf(await siegeApi.verrouiller(idVoyage, Number(numSiege)))
    const next = {
      idVoyage,
      numSiege: Number(response?.numSiege ?? numSiege),
      secondesRestantes: Number(response?.secondesRestantes ?? 900),
    }
    if (requestId !== requestRef.current || !mountedRef.current) {
      await siegeApi.liberer(idVoyage, next.numSiege).catch(() => {})
      return null
    }
    lockRef.current = next
    setLock(next)
    setRemainingSeconds(next.secondesRestantes)
    return next
  }, [release])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      requestRef.current += 1
      const current = lockRef.current
      lockRef.current = null
      if (current) siegeApi.liberer(current.idVoyage, current.numSiege).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!lock) {
      setRemainingSeconds(0)
      return undefined
    }
    const expiresAt = Date.now() + Math.max(0, lock.secondesRestantes) * 1000
    const tick = () => {
      const left = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
      setRemainingSeconds(left)
      if (left === 0 && lockRef.current === lock) {
        lockRef.current = null
        setLock(null)
        siegeApi.liberer(lock.idVoyage, lock.numSiege).catch(() => {})
        onExpiredRef.current?.(lock)
      }
    }
    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [lock])

  return { lock, remainingSeconds, select, release }
}
