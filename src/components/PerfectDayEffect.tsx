import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useStore } from '../store/useStore'

export default function PerfectDayEffect() {
  const perfectDayEvent = useStore((s) => s.perfectDayEvent)
  const clearPerfectDayEvent = useStore((s) => s.clearPerfectDayEvent)
  const fired = useRef(false)

  useEffect(() => {
    if (!perfectDayEvent || fired.current) return
    fired.current = true
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#fbbf24', '#f59e0b', '#fcd34d', '#ffffff'] })
    setTimeout(() => {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.4, x: 0.3 }, colors: ['#fbbf24', '#f59e0b'] })
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.4, x: 0.7 }, colors: ['#fbbf24', '#f59e0b'] })
    }, 250)
    setTimeout(() => { clearPerfectDayEvent(); fired.current = false }, 2000)
  }, [perfectDayEvent, clearPerfectDayEvent])

  return null
}
