import { getRandomElement } from './TargetDetector'
import { generateMicroArc } from './LightningGenerator'
import config from './electricityConfig'

const cooldowns = new Map()

function generateAmbientEffect(color) {
  const el = getRandomElement()
  if (!el) return null

  const key = `ambient-${el.el?.className || Math.random()}`
  const now = Date.now()
  const last = cooldowns.get(key) || 0
  if (now - last < 2000) return null
  cooldowns.set(key, now)

  const type = Math.random()
  const cx = el.cx + (Math.random() - 0.5) * el.width * 0.6
  const cy = el.cy + (Math.random() - 0.5) * el.height * 0.6

  if (type < 0.4) {
    const radius = Math.min(el.width, el.height) * 0.15
    const bolt = generateMicroArc(cx, cy, Math.max(radius, 20))
    return { type: 'micro', bolt, x: cx, y: cy, color }
  }

  if (type < 0.7) {
    const radius = Math.min(el.width, el.height) * 0.08
    const bolt = generateMicroArc(cx, cy, Math.max(radius, 10))
    return { type: 'snap', bolt, x: cx, y: cy, color }
  }

  const radius = Math.min(el.width, el.height) * 0.12
  const bolt = generateMicroArc(cx, cy, Math.max(radius, 15))
  return { type: 'pulse', bolt, x: cx, y: cy, color }
}

export { generateAmbientEffect }
