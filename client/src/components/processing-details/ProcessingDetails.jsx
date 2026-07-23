import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiList, FiCpu, FiX, FiAlertTriangle, FiArrowLeft, FiCheckCircle, FiPlus } from 'react-icons/fi'
import ConfirmModal from '../confirm-modal/ConfirmModal'
import cloudIcon from '../../assets/1_Cloud_upload_icon_with_soft_gradient.png'
import sparkleIcon from '../../assets/2_Mint_sparkle_icon_on_white_canvas.png'
import downloadIcon from '../../assets/5_Minimalist_download_icon_with_soft_glow.png'
import heroImg from '../../assets/Pastel_stopwatch_with_whimsical_stars.png'
import './ProcessingDetails.css'

const PROCESSING_DETAILS = [
  { label: 'AI Model', value: 'Google Gemini' },
  { label: 'Language', value: 'English (Default)' },
  { label: 'Audio Length', value: '02:45' },
  { label: 'File Size', value: '245.6 MB' },
  { label: 'Created At', value: 'May 18, 2024 . 10:21 AM' },
]

const COMPLETED_DETAILS = [
  { label: 'AI Model', value: 'Google Gemini' },
  { label: 'Language', value: 'English (Default)' },
  { label: 'Audio Length', value: '02:45' },
  { label: 'File Size', value: '245.6 MB' },
  { label: 'Created At', value: 'May 18, 2024 . 10:21 AM' },
  { label: 'Completed At', value: 'May 18, 2024 . 10:27 AM' },
]

const STEPS = [
  {
    icon: cloudIcon,
    text: 'Google Gemini is analyzing your audio and generating subtitles.',
  },
  {
    icon: sparkleIcon,
    text: 'We ensure high accuracy and perfect timing.',
  },
  {
    icon: downloadIcon,
    text: 'Your files are secure and will be ready to download soon.',
  },
]

const COMING_SOON = [
  {
    icon: sparkleIcon,
    text: 'Automatically detect and translate multiple languages in a single video with accurate subtitles for each.',
  },
  {
    icon: downloadIcon,
    text: 'Choose from different video quality options when downloading.',
  },
  {
    icon: cloudIcon,
    text: 'Edit and refine your subtitles in real-time with our built-in editor before exporting your final video.',
  },
  {
    icon: sparkleIcon,
    text: 'Customize subtitle fonts, colors, positions, and styles to match your brand or personal preference.',
  },
]

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
}

function ProcessingDetails({ status = 'processing', onCancel }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const isComplete = status === 'completed'

  const handleCancel = () => {
    setShowConfirm(false)
    onCancel?.()
  }

  const details = isComplete ? COMPLETED_DETAILS : PROCESSING_DETAILS

  return (
    <div className="processing-details">
      <AnimatePresence mode="wait">
        {!isComplete ? (
          <motion.div
            key="processing"
            className="processing-details__left"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="processing-details__header">
              <FiList className="processing-details__header-icon" />
              <h3 className="processing-details__title">Processing Details</h3>
            </div>

            <div className="processing-details__list">
              {details.map((item) => (
                <div key={item.label} className="processing-details__row">
                  <span className="processing-details__label">{item.label}</span>
                  <span className="processing-details__value">{item.value}</span>
                </div>
              ))}
            </div>

            <button className="processing-details__cancel" onClick={() => setShowConfirm(true)}>
              <FiX size={16} />
              Cancel Processing
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            className="processing-details__left"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="processing-details__header">
              <FiCheckCircle className="processing-details__header-icon processing-details__header-icon--completed" />
              <h3 className="processing-details__title">Completed Details</h3>
            </div>

            <motion.div className="processing-details__list" variants={stagger} initial="hidden" animate="show">
              {details.map((item) => (
                <motion.div key={item.label} className="processing-details__row" variants={fadeUp}>
                  <span className="processing-details__label">{item.label}</span>
                  <span className="processing-details__value">{item.value}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.button
              className="processing-details__new-video"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiPlus size={16} />
              New Video
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="processing-details__right">
        <div className="processing-details__wait-header">
          <FiCpu className="processing-details__wait-icon" />
          <h3 className="processing-details__wait-title">
            {isComplete ? 'Coming Soon' : 'While you wait'}
          </h3>
        </div>

        <p className="processing-details__wait-subtitle">
          {isComplete
            ? 'After hearing from our customers, we\'re working on features that will make your experience even better.'
            : 'Great things take a little time.'}
        </p>
        <p className="processing-details__wait-desc">
          {isComplete ? 'Here\'s what\'s coming:' : 'Here\'s what\'s happening:'}
        </p>

        <div className="processing-details__steps">
          <div className="processing-details__steps-list">
            {(isComplete ? COMING_SOON : STEPS).map((step, i) => (
              <div key={i} className={`processing-details__step ${isComplete ? 'processing-details__step--done' : ''}`}>
                <img className="processing-details__step-icon" src={step.icon} alt="" />
                <span className="processing-details__step-text">{step.text}</span>
              </div>
            ))}
          </div>

          <div className="processing-details__steps-image">
            <img className="processing-details__hero-img" src={heroImg} alt="" />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        message="Are you sure you want to cancel processing?"
        icon={<FiAlertTriangle />}
        leftLabel="Go back"
        rightLabel="Yes, cancel"
        leftIcon={<FiArrowLeft />}
        rightIcon={<FiX />}
        onLeft={() => setShowConfirm(false)}
        onRight={handleCancel}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default ProcessingDetails
