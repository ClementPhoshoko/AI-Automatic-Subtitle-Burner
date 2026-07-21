import config from './electricityConfig'

const cache = { elements: [], lastScan: 0 }
const SCAN_INTERVAL = 2000

function getVisibleElements() {
  const now = Date.now()
  if (cache.lastScan && now - cache.lastScan < SCAN_INTERVAL) return cache.elements

  const results = []
  const selectors = config.target.selectors.join(',')

  try {
    const els = document.querySelectorAll(selectors)
    for (const el of els) {
      const rect = el.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight

      if (
        rect.left < vw &&
        rect.top < vh &&
        rect.right > 0 &&
        rect.bottom > 0
      ) {
        results.push({
          el,
          rect,
          cx: rect.left + rect.width / 2,
          cy: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        })
      }
    }
  } catch (_) {}

  cache.elements = results
  cache.lastScan = now
  return results
}

function getRandomElement() {
  const els = getVisibleElements()
  if (!els.length) return null
  return els[Math.floor(Math.random() * els.length)]
}

function getRandomViewportPoint() {
  return {
    cx: Math.random() * window.innerWidth,
    cy: Math.random() * window.innerHeight,
    width: 0,
    height: 0,
    el: null,
  }
}

function getNearbyPair(maxDist) {
  const els = getVisibleElements()
  if (!els.length) return null

  const maxD = maxDist || config.target.maxDistance

  // 35% chance: bolt from a random viewport point to a random element
  if (Math.random() < 0.35) {
    const a = getRandomViewportPoint()
    const b = els[Math.floor(Math.random() * els.length)]
    return { a, b, dist: 0 }
  }

  if (els.length < 2) return null

  for (let attempts = 0; attempts < 15; attempts++) {
    const a = els[Math.floor(Math.random() * els.length)]
    const b = els[Math.floor(Math.random() * els.length)]
    if (a === b) continue

    const dx = a.cx - b.cx
    const dy = a.cy - b.cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < maxD) return { a, b, dist }
  }

  const a = els[Math.floor(Math.random() * els.length)]
  const b = els[Math.floor(Math.random() * els.length)]
  return a === b ? null : { a, b, dist: 0 }
}

export { getVisibleElements, getRandomElement, getRandomViewportPoint, getNearbyPair }
