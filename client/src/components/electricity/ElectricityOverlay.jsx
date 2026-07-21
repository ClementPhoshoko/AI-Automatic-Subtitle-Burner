import { useEffect, useRef, useState, useCallback } from 'react'
import { start, stop, handleActivity, setIdle } from './MotionController'
import config from './electricityConfig'
import './ElectricityOverlay.css'

function getComputedColor(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
}

function hexToRgba(hex, alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(99,102,241,${alpha})`
  return `rgba(${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)},${alpha})`
}

function segLen(s) {
  const dx = s.x2 - s.x1
  const dy = s.y2 - s.y1
  return Math.sqrt(dx * dx + dy * dy)
}

function totalLength(segments) {
  let len = 0
  for (const s of segments) len += segLen(s)
  return len
}

function drawProgress(progress) {
  return Math.min(progress / 0.65, 1)
}

function ElectricityOverlay() {
  const svgRef = useRef(null)
  const [ready, setReady] = useState(false)
  const idleTimer = useRef(null)

  const handleUpdate = useCallback(({ bolts, sparks }) => {
    const svg = svgRef.current
    if (!svg) return

    const primary = getComputedColor('--primary') || '#6366f1'

    let inner = ''

    for (const bolt of bolts) {
      const elapsed = performance.now() - bolt.createdAt
      if (elapsed > bolt.lifetime) continue
      const progress = elapsed / bolt.lifetime
      const draw = drawProgress(progress)
      const flicker = 1 - Math.random() * config.bolt.flickerFrequency
      const alpha = config.bolt.coreOpacity * flicker * (1 - progress)

      const mainD = BoltD(bolt.segments)
      const mainLen = totalLength(bolt.segments)
      const offset = mainLen * (1 - draw)

      // main bolt — draws from start to end
      inner += `<path d="${mainD}" fill="none" stroke="${hexToRgba(primary, alpha)}" stroke-width="${bolt.thickness}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${mainLen}" stroke-dashoffset="${offset}"/>`
      inner += `<path d="${mainD}" fill="none" stroke="rgba(255,255,255,${alpha * 0.5})" stroke-width="${Math.max(bolt.thickness * 0.4, 0.3)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${mainLen}" stroke-dashoffset="${offset}"/>`

      for (const bD of bolt.branches) {
        const bLen = totalLength(bD)
        const bOff = bLen * (1 - draw)
        inner += `<path d="${BoltD(bD)}" fill="none" stroke="${hexToRgba(primary, alpha * 0.7)}" stroke-width="${Math.max(bolt.thickness * 0.45, 0.3)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${bLen}" stroke-dashoffset="${bOff}"/>`
        inner += `<path d="${BoltD(bD)}" fill="none" stroke="rgba(255,255,255,${alpha * 0.35})" stroke-width="${Math.max(bolt.thickness * 0.25, 0.2)}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${bLen}" stroke-dashoffset="${bOff}"/>`
      }
    }

    // Render sparks
    for (const s of sparks) {
      const progress = s.elapsed / s.lifetime
      const alpha = (1 - progress) * 0.85
      inner += `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${s.size * (1 - progress * 0.5)}" fill="${hexToRgba(s.color || primary, alpha)}"/>`
      inner += `<circle cx="${s.x.toFixed(1)}" cy="${s.y.toFixed(1)}" r="${Math.max(s.size * 0.4 * (1 - progress * 0.5), 0.5)}" fill="rgba(255,255,255,${alpha * 0.5})"/>`
    }

    svg.innerHTML = inner
  }, [])

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return

    const primary = getComputedColor('--primary') || '#6366f1'
    start(primary, handleUpdate)

    const onActivity = () => {
      handleActivity()
      clearTimeout(idleTimer.current)
      idleTimer.current = setTimeout(() => setIdle(true), config.ambient.idleThreshold)
    }

    window.addEventListener('mousemove', onActivity)
    window.addEventListener('click', onActivity)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('touchstart', onActivity)

    return () => {
      stop()
      clearTimeout(idleTimer.current)
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('click', onActivity)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('touchstart', onActivity)
    }
  }, [ready, handleUpdate])

  return (
    <svg
      ref={svgRef}
      className="electricity-overlay"
      aria-hidden="true"
    />
  )
}

function BoltD(segments) {
  if (!segments.length) return ''
  let d = `M ${segments[0].x1.toFixed(1)} ${segments[0].y1.toFixed(1)}`
  for (const s of segments) {
    d += ` L ${s.x2.toFixed(1)} ${s.y2.toFixed(1)}`
  }
  return d
}

export default ElectricityOverlay
