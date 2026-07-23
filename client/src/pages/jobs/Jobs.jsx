import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCpu, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import playIcon from '../../assets/Soft tech play icon with cloud.png'
import completeIcon from '../../assets/Soft_UI_icon_with_cloud_and_sparkle.png'
import starIcon from '../../assets/Symmetrical_gray_star_icon.png'
import notFoundImg from '../../assets/Confused by a broken screen.png'
import JobProgressCard from '../../components/job-progress-card/JobProgressCard'
import JobsQueue from '../../components/queue/JobsQueue'
import ProcessingDetails from '../../components/processing-details/ProcessingDetails'
import { useJobProgress } from '../../hooks/useJobProgress'
import { useQueue } from '../../hooks/useQueue'
import { deleteJob } from '../../api/jobs'
import './Jobs.css'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function Jobs() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const { job, loading, error } = useJobProgress(jobId)
  const { jobs: queueJobs, estimatedWait, loading: queueLoading } = useQueue(jobId)

  const isComplete = job?.status === 'completed'
  const isValidUuid = UUID_RE.test(jobId)
  const isExpired = isValidUuid && error?.raw === 'Job not found'

  const handleCancel = async () => {
    try {
      await deleteJob(jobId)
    } catch {}
    navigate('/')
  }

  if (loading) {
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
          <div className="jobs-layout">
            <div className="jobs-layout__main">
              <JobProgressCard loading />
            </div>
            <div className="jobs-layout__sidebar">
              <JobsQueue loading />
            </div>
          </div>
        </div>

        <ProcessingDetails loading />
      </section>
    )
  }

  if (error) {
    return (
      <section className="jobs">
        <motion.div
          className="jobs-not-found"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            className="jobs-not-found__image"
            src={notFoundImg}
            alt=""
          />
          <h3 className="jobs-not-found__title">
            {isExpired ? 'This job was deleted' : 'Job not found'}
          </h3>
          <p className="jobs-not-found__desc">
            {isExpired
              ? 'This video was automatically removed after 2 hours. Files are temporary to keep our system fast.'
              : 'The job you\'re looking for doesn\'t exist or has been removed. Please try uploading again.'}
          </p>
          <button className="jobs-not-found__btn" onClick={() => navigate('/')}>
            <FiArrowLeft size={16} />
            Back to Home
          </button>
        </motion.div>
      </section>
    )
  }

  if (!job) {
    return (
      <section className="jobs">
        <motion.div
          className="jobs-not-found"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            className="jobs-not-found__image"
            src={notFoundImg}
            alt=""
          />
          <h3 className="jobs-not-found__title">Job not found</h3>
          <p className="jobs-not-found__desc">
            This job does not exist or has been removed.
          </p>
          <button className="jobs-not-found__btn" onClick={() => navigate('/')}>
            <FiArrowLeft size={16} />
            Back to Home
          </button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="jobs">
      <div className="jobs-hero">
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div
              key="processing-hero"
              className="jobs-hero__left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="jobs-hero__title">
                <FiCpu className="jobs-hero__ai-icon" size={28} />
                Your video is<br />
                Being{' '}<span className="jobs-hero__accent">processed</span>
                <img className="jobs-hero__star-icon" src={starIcon} alt="" />.
              </h1>
              <p className="jobs-hero__desc">
                Sit back and relax! We're generating accurate subtitles for your video using Google Gemini.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="completed-hero"
              className="jobs-hero__left"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="jobs-hero__title">
                <FiCheckCircle className="jobs-hero__ai-icon jobs-hero__ai-icon--complete" size={28} />
                Your video is<br />
                ready to <span className="jobs-hero__accent">download!</span>
                <img className="jobs-hero__star-icon" src={starIcon} alt="" />.
              </h1>
              <p className="jobs-hero__desc">
                We've generated accurate subtitles for your video using Google Gemini. You can preview, download, and share it now.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="jobs-hero__right">
          <AnimatePresence mode="wait">
            <motion.img
              key={isComplete ? 'complete-icon' : 'play-icon'}
              className="jobs-hero__img"
              src={isComplete ? completeIcon : playIcon}
              alt=""
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </AnimatePresence>
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
                  loading={queueLoading}
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
                  jobId={job.id}
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
                  outputVideoUrl={job.outputVideoUrl}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ProcessingDetails job={job} status={job.status} loading={loading} onCancel={handleCancel} />
    </section>
  )
}

export default Jobs
