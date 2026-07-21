import { getRandomElement } from './TargetDetector'
import { generateBolt } from './LightningGenerator'
import config from './electricityConfig'

const activeCrawls = []
let crawlId = 0

function generateBorderCrawl(color) {
  if (activeCrawls.length >= config.border.maxActive) return null

  const el = getRandomElement()
  if (!el || !el.el) return null

  const rect = el.el.getBoundingClientRect()
  const w = rect.width
  const h = rect.height
  const cx = rect.left + w / 2
  const cy = rect.top + h / 2

  const perimeter = 2 * (w + h)
  const travelDist = perimeter * (0.3 + Math.random() * 0.5)
  const corner = Math.floor(Math.random() * 4)
  let x1, y1, x2, y2

  switch (corner) {
    case 0:
      x1 = rect.left
      y1 = rect.top
      break
    case 1:
      x1 = rect.right
      y1 = rect.top
      break
    case 2:
      x1 = rect.right
      y1 = rect.bottom
      break
    default:
      x1 = rect.left
      y1 = rect.bottom
  }

  const travelAngle = Math.random() * Math.PI * 2
  x2 = x1 + Math.cos(travelAngle) * travelDist * 0.3
  y2 = y1 + Math.sin(travelAngle) * travelDist * 0.3

  x2 = Math.max(rect.left - 10, Math.min(rect.right + 10, x2))
  y2 = Math.max(rect.top - 10, Math.min(rect.bottom + 10, y2))

  const bolt = generateBolt(x1, y1, x2, y2)
  bolt.lifetime = config.border.fadeDuration

  crawlId++
  const crawl = {
    id: crawlId,
    bolt,
    x: cx,
    y: cy,
    color,
    createdAt: performance.now(),
    fadeDuration: config.border.fadeDuration,
  }

  activeCrawls.push(crawl)
  return crawl
}

function getActiveCrawls() {
  return activeCrawls
}

function cleanupCrawls() {
  const now = performance.now()
  for (let i = activeCrawls.length - 1; i >= 0; i--) {
    if (now - activeCrawls[i].createdAt > activeCrawls[i].fadeDuration) {
      activeCrawls.splice(i, 1)
    }
  }
}

export { generateBorderCrawl, getActiveCrawls, cleanupCrawls }
