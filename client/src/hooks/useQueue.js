import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchQueue } from '../api/jobs'
import { getUserNumber, calculateEstimatedWait } from '../utils/format'

const POLL_INTERVAL = 4000

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function transformQueue(raw, myJobId) {
  return raw.jobs.map((j, i) => ({
    id: j.id,
    userNumber: j.id === myJobId ? getUserNumber() : Math.floor(8000 + hashCode(j.id) % 2000),
    status: j.status,
    position: i + 1,
    createdAt: j.created_at,
  }))
}

export function useQueue(myJobId = null) {
  const [queue, setQueue] = useState({ total: 0, processing: 0, queued: 0, jobs: [], myPosition: null, estimatedWait: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const load = useCallback(async () => {
    const raw = await fetchQueue()
    const jobs = transformQueue(raw, myJobId)
    const myPosition = myJobId
      ? jobs.findIndex((j) => j.id === myJobId) + 1
      : null

    setQueue({
      total: raw.total,
      processing: raw.processing,
      queued: raw.queued,
      jobs,
      myPosition,
      estimatedWait: calculateEstimatedWait(myPosition),
    })
    setError(null)
  }, [myJobId])

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        await load()
      } catch (err) {
        if (!active) return
        setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    run()

    timerRef.current = setInterval(async () => {
      try {
        await load()
      } catch {
        // keep polling
      }
    }, POLL_INTERVAL)

    return () => {
      active = false
      stop()
    }
  }, [load, stop])

  return { ...queue, loading, error, refresh: load }
}
