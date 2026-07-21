import config from './electricityConfig'

function buildPathD(segments) {
  if (!segments.length) return ''
  let d = `M ${segments[0].x1.toFixed(1)} ${segments[0].y1.toFixed(1)}`
  for (const s of segments) {
    d += ` L ${s.x2.toFixed(1)} ${s.y2.toFixed(1)}`
  }
  return d
}

function buildBoltSVG(bolt, color) {
  const mainD = buildPathD(bolt.segments)
  const branchDs = bolt.branches.map((b) => buildPathD(b))
  const flicker = 1 - Math.random() * config.bolt.flickerFrequency
  const alpha = config.bolt.coreOpacity * flicker

  const els = []

  // main bolt
  els.push(`<path d="${mainD}" fill="none" stroke="${color}" stroke-width="${bolt.thickness}" stroke-linecap="round" stroke-linejoin="round" opacity="${alpha}"/>`)
  els.push(`<path d="${mainD}" fill="none" stroke="rgba(255,255,255,${alpha * 0.5})" stroke-width="${Math.max(bolt.thickness * 0.4, 0.3)}" stroke-linecap="round" stroke-linejoin="round"/>`)

  for (const bD of branchDs) {
    els.push(`<path d="${bD}" fill="none" stroke="${color}" stroke-width="${Math.max(bolt.thickness * 0.45, 0.3)}" stroke-linecap="round" stroke-linejoin="round" opacity="${alpha * 0.7}"/>`)
    els.push(`<path d="${bD}" fill="none" stroke="rgba(255,255,255,${alpha * 0.35})" stroke-width="${Math.max(bolt.thickness * 0.25, 0.2)}" stroke-linecap="round" stroke-linejoin="round"/>`)
  }

  return els.join('\n')
}

export { buildBoltSVG, buildPathD }
