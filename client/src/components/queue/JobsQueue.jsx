import { FiClock, FiCheckCircle, FiAlertCircle, FiUploadCloud, FiCpu, FiMoreVertical } from 'react-icons/fi'
import './JobsQueue.css'

const STATUS_ICONS = {
  uploading: FiUploadCloud,
  queued: FiClock,
  processing: FiCpu,
  completed: FiCheckCircle,
  failed: FiAlertCircle,
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

function JobsQueue({ jobs = [], estimatedWait = '—', currentUserId = null }) {
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
      </div>

      <div className="jobs-queue__footer">
        <span className="jobs-queue__footer-label">Estimated time:</span>
        <span className="jobs-queue__footer-value">{estimatedWait}</span>
      </div>
    </div>
  )
}

export default JobsQueue
