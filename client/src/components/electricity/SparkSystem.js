import config from './electricityConfig'

let sparkId = 0

function createSparks(x, y, color, count) {
  const num = count || (
    config.sparks.countMin +
    Math.floor(Math.random() * (config.sparks.countMax - config.sparks.countMin))
  )

  const sparks = []
  for (let i = 0; i < num; i++) {
    sparkId++
    const angle = Math.random() * Math.PI * 2
    const speed = config.sparks.speedMin + Math.random() * (config.sparks.speedMax - config.sparks.speedMin)
    const size = config.sparks.sizeMin + Math.random() * (config.sparks.sizeMax - config.sparks.sizeMin)
    const lifetime = config.sparks.lifetimeMin + Math.random() * (config.sparks.lifetimeMax - config.sparks.lifetimeMin)

    sparks.push({
      id: sparkId,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      lifetime,
      elapsed: 0,
      color,
      decay: config.sparks.decay,
    })
  }

  return sparks
}

function updateSparks(sparks, dt) {
  const alive = []
  for (const s of sparks) {
    s.elapsed += dt
    if (s.elapsed >= s.lifetime) continue

    s.x += s.vx
    s.y += s.vy
    s.vx *= s.decay
    s.vy *= s.decay
    s.vy += 0.05

    alive.push(s)
  }
  return alive
}

export { createSparks, updateSparks }
