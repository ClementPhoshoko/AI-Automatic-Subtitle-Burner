import { useEffect, useState } from 'react'
import { fetchJobs } from '../../api/jobs'
import './QueueTracker.css'

function QueueTracker() {
  const [queued, setQueued] = useState(null)
  const [processing, setProcessing] = useState(null)
  const [recent, setRecent] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function poll() {
      try {
        const [queuedRes, processingRes, recentRes] = await Promise.all([
          fetchJobs({ status: 'queued', limit: 1 }),
          fetchJobs({ status: 'processing', limit: 1 }),
          fetchJobs({ limit: 8 }),
        ])
        if (!mounted) return
        setQueued(queuedRes.total)
        setProcessing(processingRes.total)
        setRecent(recentRes.jobs || [])
        setError(null)
      } catch {
        if (mounted) setError('Could not load queue')
      }
    }

    poll()
    const interval = setInterval(poll, 5000)
    return () => { mounted = false; clearInterval(interval) }
  }, [])

  return (
    <div className="queue-tracker card">
      <p className="queue-tracker-header">Queue</p>

      <div className="queue-stats">
        <div className="queue-stat">
          <span>In queue</span>
          <span className="queue-stat-value queue-stat-value--queued">
            {queued ?? '—'}
          </span>
        </div>
        <div className="queue-stat">
          <span>Processing</span>
          <span className="queue-stat-value queue-stat-value--processing">
            {processing ?? '—'}
          </span>
        </div>
      </div>

      {error ? (
        <p className="queue-error">{error}</p>
      ) : recent.length === 0 && queued === 0 ? (
        <p className="queue-empty">No jobs yet</p>
      ) : (
        <div className="queue-list">
          {recent.map((job) => (
            <div key={job.id} className="queue-item">
              <span className={`status-badge status-${job.status}`}>
                {job.status}
              </span>
              <span className="queue-item-id">{job.id.slice(0, 8)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default QueueTracker
