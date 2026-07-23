import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchJob } from '../api/jobs'
import {
  formatDuration,
  formatFileSize,
  formatJobTitle,
  getFileExtension,
  mapStatusToProgress,
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
    progress: mapStatusToProgress(raw.status),
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

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const doPoll = useCallback(async () => {
    if (!id) return null
    const raw = await fetchJob(id)
    const transformed = transformJob(raw)
    setJob(transformed)
    setError(null)
    if (STOP_STATUSES.includes(raw.status)) {
      stopPolling()
    }
    return raw
  }, [id, stopPolling])

  useEffect(() => {
    if (!id) return
    let active = true

    const run = async () => {
      try {
        await doPoll()
      } catch (err) {
        if (!active) return
        setError(err.message)
        stopPolling()
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
      }
    }, POLL_INTERVAL)

    return () => {
      active = false
      stopPolling()
    }
  }, [id, doPoll, stopPolling])

  return { job, loading, error }
}
