import { FiClock, FiCheckCircle, FiAlertCircle, FiUploadCloud, FiCpu, FiMoreVertical } from 'react-icons/fi'
import './JobsQueue.css'

const STATUS_ICONS = {
  uploading: FiUploadCloud,
  queued: FiClock,
  processing: FiCpu,
  completed: FiCheckCircle,
  failed: FiAlertCircle,
}

function formatTimeAgo(dateString) {
  if (!dateString) return ''
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function QueueItem({ job, index, isCurrentUser }) {
  const StatusIcon = STATUS_ICONS[job.status] || FiClock

  return (
    <div className="jobs-queue__item">
      <div className="jobs-queue__item-left">
        <div className={`jobs-queue__number ${isCurrentUser ? 'jobs-queue__number--you' : ''}`}>
          {job.position}
        </div>
      </div>

      <div className="jobs-queue__item-body">
        <span className={`jobs-queue__username ${isCurrentUser ? 'jobs-queue__username--you' : ''}`}>
          {isCurrentUser ? 'You' : `Anonymous User #${job.userNumber}`}
        </span>
        {job.createdAt && (
          <span className="jobs-queue__time">Added {formatTimeAgo(job.createdAt)}</span>
        )}
      </div>

      <div className="jobs-queue__item-right">
        <span className={`jobs-queue__status jobs-queue__status--${job.status}`}>
          <StatusIcon className="jobs-queue__status-icon" />
          {job.status}
        </span>
        <span className="jobs-queue__position">Position #{job.position}</span>
      </div>
    </div>
  )
}

function JobsQueue({ jobs = [], estimatedWait = '—', currentUserId = null, loading = false }) {
  const currentUserJob = jobs.find(j => j.id === currentUserId)
  const currentUserIndex = jobs.findIndex(j => j.id === currentUserId)

  const showEllipsis = currentUserIndex >= 3

  const topItems = jobs.slice(0, 3)

  return (
    <div className="jobs-queue">
      <div className="jobs-queue__header">
        <h3 className="jobs-queue__title">Jobs Queue</h3>
        <span className="jobs-queue__live">
          <span className="jobs-queue__live-dot" />
          Live
        </span>
      </div>

      <div className="jobs-queue__list">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="jobs-queue__item jobs-queue__item--skeleton">
                <div className="jobs-queue__item-left">
                  <div className="jobs-queue__skeleton-circle" />
                </div>
                <div className="jobs-queue__item-body">
                  <div className="jobs-queue__skeleton-text jobs-queue__skeleton-text--name" />
                  <div className="jobs-queue__skeleton-text jobs-queue__skeleton-text--time" />
                </div>
                <div className="jobs-queue__item-right">
                  <div className="jobs-queue__skeleton-text jobs-queue__skeleton-text--status" />
                  <div className="jobs-queue__skeleton-text jobs-queue__skeleton-text--position" />
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {topItems.map((job, index) => (
              <QueueItem
                key={job.id}
                job={job}
                index={index}
                isCurrentUser={job.id === currentUserId}
              />
            ))}

            {showEllipsis && currentUserJob && (
              <>
                <div className="jobs-queue__ellipsis">
                  <FiMoreVertical className="jobs-queue__ellipsis-icon" />
                  <FiMoreVertical className="jobs-queue__ellipsis-icon" />
                  <FiMoreVertical className="jobs-queue__ellipsis-icon" />
                </div>
                <QueueItem
                  job={currentUserJob}
                  index={currentUserIndex}
                  isCurrentUser
                />
              </>
            )}
          </>
        )}
      </div>

      <div className="jobs-queue__footer">
        <span className="jobs-queue__footer-label">Estimated time:</span>
        {loading ? (
          <span className="jobs-queue__skeleton-text jobs-queue__skeleton-text--value" />
        ) : (
          <span className="jobs-queue__footer-value">{estimatedWait}</span>
        )}
      </div>
    </div>
  )
}

export default JobsQueue
