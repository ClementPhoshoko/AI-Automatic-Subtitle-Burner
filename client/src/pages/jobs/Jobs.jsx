import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCpu, FiAlertCircle, FiArrowLeft } from 'react-icons/fi'
import playIcon from '../../assets/Soft tech play icon with cloud.png'
import starIcon from '../../assets/Symmetrical_gray_star_icon.png'
import JobProgressCard from '../../components/job-progress-card/JobProgressCard'
import JobsQueue from '../../components/queue/JobsQueue'
import ProcessingDetails from '../../components/processing-details/ProcessingDetails'
import { useJobProgress } from '../../hooks/useJobProgress'
import { useQueue } from '../../hooks/useQueue'
import './Jobs.css'

function Jobs() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { job, loading, error } = useJobProgress(jobId)
  const { jobs: queueJobs, estimatedWait } = useQueue(jobId)

  const isComplete = job?.status === 'completed'

  if (loading) {
    return (
      <section className="jobs">
        <div className="jobs-loading">
          <div className="jobs-loading__spinner" />
          <p className="jobs-loading__text">Loading job...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="jobs">
        <div className="jobs-error">
          <FiAlertCircle className="jobs-error__icon" />
          <h3 className="jobs-error__title">{error.title || 'Something went wrong'}</h3>
          <p className="jobs-error__text">{error.message || 'Could not load this job. Please try again.'}</p>
          <button className="jobs-error__back" onClick={() => navigate('/')}>
            <FiArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </section>
    )
  }

  if (!job) {
    return (
      <section className="jobs">
        <div className="jobs-error">
          <FiAlertCircle className="jobs-error__icon" />
          <h3 className="jobs-error__title">Job not found</h3>
          <p className="jobs-error__text">This job does not exist or has been removed.</p>
          <button className="jobs-error__back" onClick={() => navigate('/')}>
            <FiArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="jobs">
      <div className="jobs-hero">
        <div className="jobs-hero__left">
          <h1 className="jobs-hero__title">
            <FiCpu className="jobs-hero__ai-icon" size={28} />
            Your video is<br />
            Being{' '}<span className="jobs-hero__accent">processed</span>
            <img className="jobs-hero__star-icon" src={starIcon} alt="" />.
          </h1>
          <p className="jobs-hero__desc">
            Sit back and relax! We're generating accurate subtitles for your video using Google Gemini.
          </p>
        </div>
        <div className="jobs-hero__right">
          <img className="jobs-hero__img" src={playIcon} alt="" />
        </div>
      </div>

      <div className="jobs-content">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key="processing-layout"
              className="jobs-layout"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="jobs-layout__main">
                <JobProgressCard
                  thumbnail={job.thumbnail}
                  title={job.title}
                  format={job.format}
                  resolution={job.resolution}
                  fileSize={job.fileSize}
                  duration={job.duration}
                  status={job.status}
                  progress={job.progress}
                  estimatedTime={job.estimatedTime}
                  workflowStage={job.workflowStage}
                  uploadTime={job.uploadTime}
                />
              </div>
              <div className="jobs-layout__sidebar">
                <JobsQueue
                  jobs={queueJobs}
                  estimatedWait={estimatedWait}
                  currentUserId={jobId}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="completed-layout"
              className="jobs-layout jobs-layout--completed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="jobs-layout__main jobs-layout__main--full">
                <JobProgressCard
                  thumbnail={job.thumbnail}
                  title={job.title}
                  format={job.format}
                  resolution={job.resolution}
                  fileSize={job.fileSize}
                  duration={job.duration}
                  status={job.status}
                  progress={job.progress}
                  estimatedTime={job.estimatedTime}
                  workflowStage={job.workflowStage}
                  uploadTime={job.uploadTime}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProcessingDetails job={job} status={job.status} />
    </section>
  )
}

export default Jobs
