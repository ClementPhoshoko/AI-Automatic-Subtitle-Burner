import { useState, useEffect, useCallback } from 'react'
import { fetchJobs, fetchJob, uploadVideo, deleteJob } from '../api/jobs'

export function useJobs({ status, limit = 50, offset = 0, autoRefresh = false, intervalMs = 5000 } = {}) {
  const [jobs, setJobs] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await fetchJobs({ status, limit, offset })
      setJobs(data.jobs || [])
      setTotal(data.total || 0)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [status, limit, offset])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        const data = await fetchJobs({ status, limit, offset })
        if (!active) return
        setJobs(data.jobs || [])
        setTotal(data.total || 0)
        setError(null)
      } catch (err) {
        if (!active) return
        setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [status, limit, offset])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(load, intervalMs)
    return () => clearInterval(id)
  }, [autoRefresh, intervalMs, load])

  const remove = useCallback(async (id) => {
    await deleteJob(id)
    setJobs((prev) => prev.filter((j) => j.id !== id))
    setTotal((prev) => prev - 1)
  }, [])

  return { jobs, total, loading, error, refresh: load, remove }
}

export function useJob(id) {
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!id) return
    try {
      const data = await fetchJob(id)
      setJob(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return
    let active = true
    const run = async () => {
      try {
        const data = await fetchJob(id)
        if (!active) return
        setJob(data)
        setError(null)
      } catch (err) {
        if (!active) return
        setError(err.message)
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => { active = false }
  }, [id])

  const upload = useCallback(async (file, subtitleStyle, onProgress) => {
    const data = await uploadVideo(file, subtitleStyle, onProgress)
    setJob(data)
    return data
  }, [])

  return { job, loading, error, refresh: load, upload }
}
