import { motion } from 'framer-motion'
import { FiClock, FiAlertCircle, FiVideo } from 'react-icons/fi'
import WorkflowTimeline from './WorkflowTimeline'
import './JobProgressCard.css'

function JobProgressCard({
  thumbnail,
  title = 'Untitled video',
  format = 'MP4',
  resolution = '1920×1080',
  fileSize = '—',
  duration = '—',
  status = 'processing',
  progress = 0,
  estimatedTime = '',
  workflowStage = 0,
  loading = false,
  empty = false,
  error = false,
  errorMessage = '',
}) {
  if (empty) {
    return (
      <div className="job-progress-card job-progress-card--empty">
        <FiVideo className="job-progress-card__empty-icon" />
        <h3 className="job-progress-card__empty-title">No active jobs</h3>
        <p className="job-progress-card__empty-desc">
          Upload a video to get started. Your processing jobs will appear here.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="job-progress-card job-progress-card--error">
        <div className="job-progress-card__error">
          <FiAlertCircle className="job-progress-card__error-icon" />
          <h3 className="job-progress-card__error-title">Processing failed</h3>
          <p className="job-progress-card__error-desc">
            {errorMessage || 'Something went wrong during processing. Please try again.'}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="job-progress-card job-progress-card--skeleton">
        <div className="job-progress-card__main">
          <div className="job-progress-card__thumbnail-wrap" />
          <div className="job-progress-card__info">
            <div className="job-progress-card__title" />
            <div className="job-progress-card__meta">
              <span className="job-progress-card__meta-item" />
              <span className="job-progress-card__meta-dot" />
              <span className="job-progress-card__meta-item" />
              <span className="job-progress-card__meta-dot" />
              <span className="job-progress-card__meta-item" />
            </div>
            <div className="job-progress-card__progress-section">
              <div className="job-progress-card__progress-top">
                <div className="job-progress-card__status-badge" />
                <div className="job-progress-card__progress-row">
                  <span className="job-progress-card__percentage" style={{ visibility: 'hidden' }}>—</span>
                </div>
              </div>
              <div className="job-progress-card__bar" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statusLabel = {
    uploading: 'Uploading',
    queued: 'Queued',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
  }

  const isComplete = status === 'completed'
  const isFailed = status === 'failed'

  return (
    <motion.div
      className="job-progress-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="job-progress-card__main">
        <div className="job-progress-card__thumbnail-wrap">
          {thumbnail ? (
            <img className="job-progress-card__thumbnail" src={thumbnail} alt="" />
          ) : (
            <div className="job-progress-card__thumbnail" />
          )}
          <span className="job-progress-card__duration">{duration}</span>
        </div>

        <div className="job-progress-card__info">
          <h3 className="job-progress-card__title" title={title}>
            {title}
          </h3>

          <div className="job-progress-card__meta">
            <span className="job-progress-card__meta-item">{format}</span>
            <span className="job-progress-card__meta-dot" />
            <span className="job-progress-card__meta-item">{resolution}</span>
            <span className="job-progress-card__meta-dot" />
            <span className="job-progress-card__meta-item">{fileSize}</span>
          </div>

          <div className="job-progress-card__progress-section">
            <div className="job-progress-card__progress-top">
              <span className={`job-progress-card__status-badge job-progress-card__status-badge--${status}`}>
                {(status === 'processing' || status === 'uploading') && (
                  <span className={`job-progress-card__spinner job-progress-card__spinner--${status}`} />
                )}
                {statusLabel[status] || status}
              </span>

              <div className="job-progress-card__progress-row">
                <motion.span
                  className="job-progress-card__percentage"
                  key={Math.round(progress)}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {isComplete ? '100%' : `${Math.round(progress)}%`}
                </motion.span>

                {estimatedTime && !isComplete && !isFailed && (
                  <span className="job-progress-card__eta">
                    <span className="job-progress-card__eta-label">Time Left:</span>
                    {estimatedTime}
                  </span>
                )}
              </div>
            </div>

            <div className="job-progress-card__bar-wrap">
              <div className="job-progress-card__bar">
                <motion.div
                  className="job-progress-card__bar-fill"
                  initial={{ width: 0 }}
                  animate={{ width: isComplete ? '100%' : `${Math.max(progress, 2)}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="job-progress-card__workflow">
        <WorkflowTimeline
          currentStage={isComplete ? 5 : workflowStage}
          failed={isFailed}
        />
      </div>
    </motion.div>
  )
}

export default JobProgressCard
