import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiClock, FiAlertCircle, FiVideo, FiCheckCircle, FiGlobe, FiFileText, FiDownload, FiShare2, FiMoreHorizontal, FiPlay } from 'react-icons/fi'
import { downloadSubtitles, getSubtitlesUrl } from '../../api/jobs'
import WorkflowTimeline from './WorkflowTimeline'
import './JobProgressCard.css'

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

function JobProgressCard({
  jobId,
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
  language = 'English',
  subtitlesPercent = 100,
  outputVideoUrl,
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
  const [hasStarted, setHasStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef(null)

  const handlePlayClick = () => {
    setHasStarted(true)
    setPlaying(true)
    requestAnimationFrame(() => {
      videoRef.current?.play()
    })
  }

  const handleVideoPlay = () => setPlaying(true)
  const handleVideoPause = () => setPlaying(false)
  const handleVideoEnded = () => setPlaying(false)

  // ---- COMPLETED STATE ----
  if (isComplete) {
    return (
      <motion.div
        className="job-progress-card job-progress-card--expanded"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <div className="job-progress-card__main">
          {/* VIDEO PLAYER (same size as thumbnail) */}
          <motion.div className={`job-progress-card__thumbnail-wrap ${hasStarted ? 'job-progress-card__thumbnail-wrap--playing' : ''}`} variants={fadeUp}>
            {!hasStarted ? (
              <>
                {thumbnail ? (
                  <img className="job-progress-card__thumbnail" src={thumbnail} alt="" />
                ) : (
                  <div className="job-progress-card__thumbnail" />
                )}
                <span className="job-progress-card__duration">{duration}</span>
                <div className="job-progress-card__player-overlay" onClick={handlePlayClick}>
                  <FiPlay className="job-progress-card__player-play" />
                </div>
              </>
            ) : (
              <>
                <video
                  ref={videoRef}
                  className="job-progress-card__video"
                  src={outputVideoUrl}
                  controls
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  onEnded={handleVideoEnded}
                />
                {!playing && (
                  <div className="job-progress-card__player-overlay" onClick={() => videoRef.current?.play()}>
                    <FiPlay className="job-progress-card__player-play" />
                  </div>
                )}
              </>
            )}
          </motion.div>

          <div className="job-progress-card__info">
            {/* TITLE + META */}
            <motion.h3 className="job-progress-card__title" title={title} variants={fadeUp}>
              {title}
            </motion.h3>

            <motion.div className="job-progress-card__meta" variants={fadeUp}>
              <span className="job-progress-card__meta-item">{format}</span>
              <span className="job-progress-card__meta-dot" />
              <span className="job-progress-card__meta-item">{resolution}</span>
              <span className="job-progress-card__meta-dot" />
              <span className="job-progress-card__meta-item">{fileSize}</span>
            </motion.div>

            {/* BADGE */}
            <motion.div className="job-progress-card__progress-top" variants={fadeUp}>
              <span className="job-progress-card__status-badge job-progress-card__status-badge--completed">
                <FiCheckCircle size={12} />
                Completed
              </span>
            </motion.div>

            {/* STATS ROW */}
            <motion.div className="job-progress-card__stats" variants={fadeUp}>
              <div className="job-progress-card__stat">
                <div className="job-progress-card__stat-icon-wrap job-progress-card__stat-icon-wrap--duration">
                  <FiClock size={16} />
                </div>
                <div className="job-progress-card__stat-text">
                  <span className="job-progress-card__stat-value">{duration}</span>
                  <span className="job-progress-card__stat-label">Duration</span>
                </div>
              </div>
              <div className="job-progress-card__stat-divider" />
              <div className="job-progress-card__stat">
                <div className="job-progress-card__stat-icon-wrap job-progress-card__stat-icon-wrap--language">
                  <FiGlobe size={16} />
                </div>
                <div className="job-progress-card__stat-text">
                  <span className="job-progress-card__stat-value">{language}</span>
                  <span className="job-progress-card__stat-label">Language</span>
                </div>
              </div>
              <div className="job-progress-card__stat-divider" />
              <div className="job-progress-card__stat">
                <div className="job-progress-card__stat-icon-wrap job-progress-card__stat-icon-wrap--subtitles">
                  <FiFileText size={16} />
                </div>
                <div className="job-progress-card__stat-text">
                  <span className="job-progress-card__stat-value">{subtitlesPercent}%</span>
                  <span className="job-progress-card__stat-label">Subtitles</span>
                </div>
              </div>
            </motion.div>

            {/* ACTION BUTTONS */}
            <motion.div className="job-progress-card__actions" variants={fadeUp}>
              <motion.button className="job-progress-card__action job-progress-card__action--primary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => {
                if (!outputVideoUrl) return
                const a = document.createElement('a')
                a.href = outputVideoUrl
                a.download = `${title}_burner_akovolabs.${format.toLowerCase()}`
                document.body.appendChild(a)
                a.click()
                a.remove()
              }}>
                <FiDownload size={14} />
                Download Video
              </motion.button>
              <motion.button className="job-progress-card__action job-progress-card__action--secondary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => jobId && downloadSubtitles(jobId, `${title}.srt`)}>
                <FiFileText size={14} />
                Download Subtitles (.srt)
              </motion.button>
              <div className="job-progress-card__actions-right">
                <motion.button className="job-progress-card__action job-progress-card__action--secondary" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => {
                  if (navigator.share && outputVideoUrl) {
                    navigator.share({ title, url: outputVideoUrl })
                  } else if (outputVideoUrl) {
                    navigator.clipboard.writeText(outputVideoUrl)
                  }
                }}>
                  <FiShare2 size={14} />
                  Share Video
                </motion.button>
                <motion.button className="job-progress-card__action job-progress-card__action--icon" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <FiMoreHorizontal size={16} />
                </motion.button>
              </div>
            </motion.div>

            {/* EXPIRATION NOTICE */}
            <motion.p className="job-progress-card__expiry" variants={fadeUp}>
              Files expire in 2 hours. Download now to keep them.
            </motion.p>
          </div>
        </div>

        {/* WORKFLOW TIMELINE */}
        <motion.div className="job-progress-card__workflow" variants={fadeUp}>
          <WorkflowTimeline currentStage={5} />
        </motion.div>
      </motion.div>
    )
  }

  // ---- PROCESSING STATE ----
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
                  {`${Math.round(progress)}%`}
                </motion.span>

                {estimatedTime && !isFailed && (
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
                  animate={{ width: `${Math.max(progress, 2)}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="job-progress-card__workflow">
        <WorkflowTimeline
          currentStage={workflowStage}
          failed={isFailed}
        />
      </div>
    </motion.div>
  )
}

export default JobProgressCard
