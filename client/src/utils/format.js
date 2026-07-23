/* ── Duration ─────────────────────────────────── */

export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ── File size ────────────────────────────────── */

export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size < 10 ? size.toFixed(1) : Math.round(size)} ${units[i]}`
}

/* ── Relative time ────────────────────────────── */

export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/* ── Absolute time ────────────────────────────── */

export function formatAbsoluteTime(isoString) {
  if (!isoString) return '—'
  const d = new Date(isoString)
  const month = d.toLocaleString('en-US', { month: 'short' })
  const day = d.getDate()
  const year = d.getFullYear()
  const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return `${month} ${day}, ${year} . ${time}`
}

/* ── Job title ────────────────────────────────── */

export function formatJobTitle(filename) {
  if (!filename) return 'Untitled video'
  return filename.replace(/\.[^/.]+$/, '').replace(/_/g, ' ')
}

/* ── File extension ───────────────────────────── */

export function getFileExtension(filename) {
  if (!filename) return ''
  return filename.split('.').pop().toUpperCase()
}

/* ── Status → progress ────────────────────────── */

export function mapStatusToProgress(status) {
  const ranges = {
    queued: 0,
    processing: 50,
    completed: 100,
    failed: 0,
  }
  return ranges[status] ?? 0
}

/* ── Status → workflow stage (0-4) ────────────── */

export function mapStatusToWorkflowStage(status) {
  const stages = {
    queued: 0,
    processing: 2,
    completed: 4,
    failed: 2,
  }
  return stages[status] ?? 0
}

/* ── User number (per-session) ────────────────── */

let _userNumber = null
export function getUserNumber() {
  if (_userNumber) return _userNumber
  _userNumber = Math.floor(8000 + Math.random() * 2000)
  return _userNumber
}

/* ── Estimated wait from queue position ───────── */

export function calculateEstimatedWait(position) {
  if (!position || position <= 0) return 'Almost ready'
  const avgMinutes = 3
  const total = position * avgMinutes
  if (total < 1) return 'Less than a minute'
  if (total < 60) return `~${total} min`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`
}
