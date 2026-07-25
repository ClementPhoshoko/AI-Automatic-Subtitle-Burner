import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchJob } from '../api/jobs'
import {
  formatDuration,
  formatFileSize,
  formatJobTitle,
  getFileExtension,
  mapStatusToWorkflowStage,
  formatRelativeTime,
} from '../utils/format'

const POLL_INTERVAL = 3000
const STOP_STATUSES = ['completed', 'failed']

function transformJob(raw) {
  if (!raw) return null
  return {
    id: raw.id,
    title: formatJobTitle(raw.original_filename),
    format: getFileExtension(raw.original_filename),
    resolution: raw.resolution || '—',
    fileSize: formatFileSize(raw.file_size),
    fileSizeRaw: raw.file_size,
    duration: formatDuration(raw.duration_seconds),
    durationRaw: raw.duration_seconds,
    thumbnail: raw.thumbnail_url || null,
    status: raw.status,
    workflowStage: mapStatusToWorkflowStage(raw.status),
    estimatedTime: '',
    uploadTime: formatRelativeTime(raw.created_at),
    createdAt: raw.created_at,
    completedAt: raw.completed_at,
    subtitleStyle: raw.subtitle_style,
    transcriptJson: raw.transcript_json,
    outputVideoUrl: raw.output_video_url,
    errorMessage: raw.error_message,
    language: 'English',
  }
}

export function useJobProgress(id) {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)
  const progressRef = useRef(0)
  const progressTimerRef = useRef(null)
  const [displayProgress, setDisplayProgress] = useState(0)

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const stopProgress = useCallback(() => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current)
      progressTimerRef.current = null
    }
  }, [])

  const startProgress = useCallback(() => {
    if (progressTimerRef.current) return
    progressRef.current = 10
    setDisplayProgress(10)
    progressTimerRef.current = setInterval(() => {
      const remaining = 95 - progressRef.current
      const step = Math.max(0.5, remaining * 0.04)
      progressRef.current = Math.min(progressRef.current + step, 95)
      setDisplayProgress(Math.round(progressRef.current))
    }, 1000)
  }, [])

  const doPoll = useCallback(async () => {
    if (!id) return null
    const raw = await fetchJob(id)
    const transformed = transformJob(raw)
    setJob(transformed)
    setError(null)

    if (raw.status === 'completed') {
      stopProgress()
      progressRef.current = 100
      setDisplayProgress(100)
      stopPolling()
    } else if (raw.status === 'failed') {
      stopProgress()
      progressRef.current = 0
      setDisplayProgress(0)
      stopPolling()
    } else if (raw.status === 'processing') {
      startProgress()
    } else {
      stopProgress()
      progressRef.current = 0
      setDisplayProgress(0)
    }

    return raw
  }, [id, stopPolling, stopProgress, startProgress])

  useEffect(() => {
    if (!id) return
    let active = true

    const run = async () => {
      try {
        await doPoll()
      } catch (err) {
        if (!active) return
        setError({
          title: err.title || 'Something went wrong',
          message: err.message || 'Could not load this job.',
          raw: err.raw,
        })
        stopPolling()
        stopProgress()
      } finally {
        if (active) setLoading(false)
      }
    }
    run()

    timerRef.current = setInterval(async () => {
      try {
        await doPoll()
      } catch {
        stopPolling()
        stopProgress()
      }
    }, POLL_INTERVAL)

    return () => {
      active = false
      stopPolling()
      stopProgress()
    }
  }, [id, doPoll, stopPolling, stopProgress])

  return { job, loading, error, displayProgress }
}
