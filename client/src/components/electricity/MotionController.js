import { scheduleEffects } from './EffectScheduler'
import { updateSparks } from './SparkSystem'
import { cleanupCrawls, getActiveCrawls } from './BorderCrawler'

const state = {
  running: false,
  rafId: null,
  effects: { bolts: [], sparks: [], ambient: [], borders: [] },
  lastTick: 0,
  isIdle: false,
  idleTimer: null,
  color: '',
  onUpdate: null,
  hidden: false,
}

function start(color, onUpdate) {
  if (state.running) return
  state.running = true
  state.color = color
  state.onUpdate = onUpdate
  state.lastTick = performance.now()

  document.addEventListener('visibilitychange', handleVisibility)

  tick(performance.now())
}

function stop() {
  state.running = false
  if (state.rafId) cancelAnimationFrame(state.rafId)
  document.removeEventListener('visibilitychange', handleVisibility)
  state.effects = { bolts: [], sparks: [], ambient: [], borders: [] }
}

function handleVisibility() {
  state.hidden = document.hidden
  if (state.hidden) {
    if (state.rafId) cancelAnimationFrame(state.rafId)
  } else {
    state.lastTick = performance.now()
    tick(performance.now())
  }
}

function handleActivity() {
  state.isIdle = false
  clearTimeout(state.idleTimer)
}

function tick(now) {
  if (!state.running || state.hidden) return

  const dt = Math.min(now - state.lastTick, 100)
  state.lastTick = now

  const isIdle = state.isIdle

  // Schedule new effects
  const newFx = scheduleEffects(now, state.color, isIdle)

  // Merge bolts
  const bolts = [...state.effects.bolts]
  for (const b of newFx.bolts) bolts.push(b)
  state.effects.bolts = bolts.filter((b) => now - b.createdAt < b.lifetime)

  // Merge ambient
  for (const a of newFx.ambient) {
    if (a.bolt) state.effects.bolts.push(a.bolt)
  }

  // Merge borders
  cleanupCrawls()
  for (const c of newFx.borders) {
    if (c.bolt) state.effects.bolts.push(c.bolt)
  }

  // Update sparks
  state.effects.sparks = updateSparks(
    [...state.effects.sparks, ...newFx.sparks],
    dt
  )

  // Build render data
  const allBolts = state.effects.bolts
  const allSparks = state.effects.sparks

  state.onUpdate({ bolts: allBolts, sparks: allSparks })

  state.rafId = requestAnimationFrame(tick)
}

function setIdle(isIdle) {
  state.isIdle = isIdle
}

export { start, stop, handleActivity, setIdle }
