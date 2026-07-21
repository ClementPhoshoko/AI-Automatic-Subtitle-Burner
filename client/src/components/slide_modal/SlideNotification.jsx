import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi'
import './SlideNotification.css'

const ICON_MAP = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
}

const slide = {
  hidden: { x: 120, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 260 } },
  exit: { x: 120, opacity: 0, transition: { duration: 0.2 } },
}

function SlideNotification({ show, type = 'info', title, message, onClose, autoClose = 5000 }) {
  const Icon = ICON_MAP[type] || FiInfo

  useEffect(() => {
    if (!show || autoClose === false) return
    const id = setTimeout(onClose, autoClose)
    return () => clearTimeout(id)
  }, [show, autoClose, onClose])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`slide-notif slide-notif--${type}`}
          variants={slide}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="slide-notif__body">
            <div className="slide-notif__icon-wrap">
              <Icon className="slide-notif__icon" size={20} />
            </div>
            <div className="slide-notif__content">
              <p className="slide-notif__title">{title}</p>
              {message && <p className="slide-notif__msg">{message}</p>}
            </div>
          </div>
          <button className="slide-notif__close" onClick={onClose} aria-label="Close">
            <FiX size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SlideNotification
