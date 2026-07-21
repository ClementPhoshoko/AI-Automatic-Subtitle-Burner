import config from './electricityConfig'

let seedCounter = 0

function rand(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function randomRange(min, max, seed) {
  return min + rand(seed) * (max - min)
}

function buildSegments(points) {
  const segs = []
  for (let i = 0; i < points.length - 1; i++) {
    segs.push({ x1: points[i].x, y1: points[i].y, x2: points[i + 1].x, y2: points[i + 1].y })
  }
  return segs
}

function generateBolt(x1, y1, x2, y2) {
  seedCounter++
  const baseSeed = seedCounter * 7919

  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const segCount = Math.floor(
    randomRange(config.bolt.minSegments, config.bolt.maxSegments, baseSeed)
  )
  const segLen = dist / segCount
  const angle = Math.atan2(dy, dx)

  const points = [{ x: x1, y: y1 }]
  let seed = baseSeed

  for (let i = 1; i < segCount; i++) {
    seed += 13
    const t = i / segCount
    const baseX = x1 + dx * t
    const baseY = y1 + dy * t
    const perpAngle = angle + Math.PI / 2
    const jitter = randomRange(-1, 1, seed) * segLen * config.bolt.segmentJitter
    const harmonic = Math.sin(t * Math.PI * 3 + seed) * segLen * config.bolt.curveDistortion * 0.5

    points.push({
      x: baseX + Math.cos(perpAngle) * (jitter + harmonic),
      y: baseY + Math.sin(perpAngle) * (jitter + harmonic),
    })
  }

  points.push({ x: x2, y: y2 })
  const segments = buildSegments(points)
  const branches = []

  // Decide bolt personality
  seed += 7
  const isSimple = rand(seed) < config.bolt.simpleBoltProbability
  const isDramatic = !isSimple && rand(seed + 11) > 0.7
  const hasCrowFoot = !isSimple && rand(seed + 19) < config.bolt.crowFootProbability

  const branchCount = isSimple
    ? Math.floor(randomRange(0, 2, seed + 29))
    : Math.floor(randomRange(1, config.bolt.maxBranches, seed + 37))

  for (let b = 0; b < branchCount; b++) {
    seed += 31
    if (rand(seed) > config.bolt.branchProbability) continue

    const segIdx = Math.floor(randomRange(0, segments.length - 1, seed + b * 7))
    const seg = segments[segIdx]
    const segAngle = Math.atan2(seg.y2 - seg.y1, seg.x2 - seg.x1)

    const isTerminal = segIdx >= segments.length - 2
    const useCrowFoot = isTerminal && hasCrowFoot

    // Branch angle — tighter for regular, wider for crow's foot
    const angleSpread = isDramatic && isTerminal
      ? config.bolt.crowFootSpread
      : useCrowFoot ? config.bolt.crowFootSpread * 0.8 : 0.8
    const branchAngle = segAngle + randomRange(-angleSpread, angleSpread, seed + 43)

    const bx = seg.x1 + (seg.x2 - seg.x1) * randomRange(0.2, 0.8, seed + 53)
    const by = seg.y1 + (seg.y2 - seg.y1) * randomRange(0.2, 0.8, seed + 53)

    // Branch length — varies dramatically
    let branchLen
    if (useCrowFoot) {
      branchLen = randomRange(segLen * 0.6, segLen * 1.6, seed + 61)
    } else if (isDramatic) {
      branchLen = randomRange(segLen * 0.3, segLen * 1.4, seed + 67)
    } else {
      branchLen = randomRange(segLen * 0.2, segLen * 0.8, seed + 71)
    }

    const bSegs = useCrowFoot
      ? Math.floor(randomRange(5, 8, seed + 79))
      : Math.floor(randomRange(2, 5, seed + 83))

    const branchPoints = [{ x: bx, y: by }]
    for (let j = 1; j <= bSegs; j++) {
      const t = j / bSegs
      const jit = randomRange(-1, 1, seed + j * 41) * segLen * (useCrowFoot ? 0.35 : 0.2)
      const pa = branchAngle + Math.PI / 2
      const curve = Math.sin(t * Math.PI * 2.5 + seed) * segLen * 0.25 * t
      branchPoints.push({
        x: bx + Math.cos(branchAngle) * branchLen * t + Math.cos(pa) * (jit + curve),
        y: by + Math.sin(branchAngle) * branchLen * t + Math.sin(pa) * (jit + curve),
      })
    }

    branches.push(buildSegments(branchPoints))

    // Sub-branches (secondary forks) — only for dramatic or crow's foot
    if (!useCrowFoot && !isDramatic) continue
    seed += 89
    const subCount = Math.floor(randomRange(0, config.bolt.crowFootBranches, seed))
    for (let sb = 0; sb < subCount; sb++) {
      seed += 97
      if (rand(seed) > 0.45) continue

      const subSegIdx = Math.floor(randomRange(0, branchPoints.length - 2, seed + sb * 11))
      const sp = branchPoints[subSegIdx]
      const spNext = branchPoints[subSegIdx + 1]
      const subAngle = Math.atan2(spNext.y - sp.y, spNext.x - sp.x) +
        randomRange(-1.0, 1.0, seed + 103)
      const subLen = branchLen * randomRange(0.15, 0.4, seed + 107)

      const subPoints = [{ x: sp.x, y: sp.y }]
      const subSegs = Math.floor(randomRange(2, 4, seed + 109))
      for (let j = 1; j <= subSegs; j++) {
        const t = j / subSegs
        const jit = randomRange(-1, 1, seed + j * 113) * segLen * 0.15
        const pa = subAngle + Math.PI / 2
        subPoints.push({
          x: sp.x + Math.cos(subAngle) * subLen * t + Math.cos(pa) * jit * t,
          y: sp.y + Math.sin(subAngle) * subLen * t + Math.sin(pa) * jit * t,
        })
      }

      branches.push(buildSegments(subPoints))
    }
  }

  const thickness = randomRange(config.bolt.thicknessMin, config.bolt.thicknessMax, baseSeed + 53)
  const lifetime = randomRange(config.bolt.lifetimeMin, config.bolt.lifetimeMax, seed + 61)

  return { segments, branches, thickness, lifetime, createdAt: performance.now() }
}

function generateMicroArc(x, y, radius) {
  seedCounter++
  const seed = seedCounter * 973
  const angle1 = randomRange(0, Math.PI * 2, seed)
  const angle2 = angle1 + randomRange(0.3, 1.2, seed + 7)
  const r1 = radius * randomRange(0.3, 0.7, seed + 13)
  const r2 = radius * randomRange(0.5, 1.0, seed + 19)

  const x1 = x + Math.cos(angle1) * r1
  const y1 = y + Math.sin(angle1) * r1
  const x2 = x + Math.cos(angle2) * r2
  const y2 = y + Math.sin(angle2) * r2

  return generateBolt(x1, y1, x2, y2)
}

export { generateBolt, generateMicroArc }
