import config from './electricityConfig'
import { getNearbyPair } from './TargetDetector'
import { generateBolt } from './LightningGenerator'
import { generateAmbientEffect } from './AmbientEnergySystem'
import { generateBorderCrawl } from './BorderCrawler'
import { createSparks } from './SparkSystem'

const recentTargets = new Map()
const MAX_RECENT_TARGETS = 50
let lastAmbientTime = 0
let lastBorderTime = 0
let lastLightningTime = 0
let boltCount = 0
let startTime = 0

function getStormIntensity(now) {
  if (!startTime) startTime = now
  const elapsed = now - startTime
  const t = Math.min(elapsed / config.storm.buildUpTime, 1)
  return {
    t,
    maxBolts: Math.floor(
      config.storm.maxBoltsBase + (config.storm.maxBoltsPeak - config.storm.maxBoltsBase) * t
    ),
    lightningInterval:
      config.storm.maxInterval -
      (config.storm.maxInterval - config.storm.minInterval) * t,
    ambientInterval:
      config.ambient.spawnInterval -
      (config.ambient.spawnInterval - config.storm.ambientPeak) * t,
  }
}

function scheduleEffects(now, color, isIdle) {
  const fx = { bolts: [], sparks: [], ambient: [], borders: [] }
  const intensity = isIdle ? config.ambient.idleMultiplier : 1.0
  const storm = getStormIntensity(now)

  const ambientInterval = storm.ambientInterval / intensity
  const lightningInterval = storm.lightningInterval / intensity
  const borderInterval = config.border.crawlFrequency / intensity

  // Ambient micro effects
  if (now - lastAmbientTime > ambientInterval * 0.5 + Math.random() * ambientInterval * 0.5) {
    const effect = generateAmbientEffect(color)
    if (effect) {
      fx.ambient.push(effect)
      if (effect.type === 'micro' || effect.type === 'snap') {
        fx.sparks.push(...createSparks(effect.x, effect.y, color, 3))
      }
      lastAmbientTime = now
    }
  }

  // Lightning between elements
  if (boltCount < storm.maxBolts && now - lastLightningTime > lightningInterval) {
    const cooldown = config.target.cooldown
    let pair = null
    for (let attempt = 0; attempt < 5; attempt++) {
      const p = getNearbyPair(config.target.maxDistance)
      if (!p) break
      const aId = p.a.el ? (p.a.el.dataset.fxId || (p.a.el.dataset.fxId = `el-${Math.random().toString(36).slice(2, 8)}`)) : 'vp'
      const bId = p.b.el ? (p.b.el.dataset.fxId || (p.b.el.dataset.fxId = `el-${Math.random().toString(36).slice(2, 8)}`)) : 'vp'
      const key = `${aId}:${bId}`
      const lastTime = recentTargets.get(key) || 0
      if (now - lastTime > cooldown) {
        pair = p
        recentTargets.set(key, now)
        if (recentTargets.size > MAX_RECENT_TARGETS) {
          const oldest = recentTargets.keys().next().value
          recentTargets.delete(oldest)
        }
        break
      }
    }

    if (pair) {
      const bolt = generateBolt(pair.a.cx, pair.a.cy, pair.b.cx, pair.b.cy)
      fx.bolts.push(bolt)
      fx.sparks.push(...createSparks(pair.b.cx, pair.b.cy, color, 5))
      boltCount++
      lastLightningTime = now

      window.dispatchEvent(new Event('stormflash'))

      const lifetime = bolt.lifetime
      setTimeout(() => { boltCount = Math.max(0, boltCount - 1) }, lifetime)
    }
  }

  // Border crawling
  if (now - lastBorderTime > borderInterval) {
    const crawl = generateBorderCrawl(color)
    if (crawl) {
      fx.borders.push(crawl)
      lastBorderTime = now
    }
  }

  return fx
}

export { scheduleEffects }
