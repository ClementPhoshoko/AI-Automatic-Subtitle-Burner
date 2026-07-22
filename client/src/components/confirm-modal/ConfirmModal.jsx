import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './ConfirmModal.css'

function ConfirmModal({
  open = false,
  message = '',
  icon = null,
  leftLabel = 'Cancel',
  rightLabel = 'Confirm',
  leftIcon = null,
  rightIcon = null,
  onLeft,
  onRight,
  onClose,
}) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="confirm-modal__overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="confirm-modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="confirm-modal__message">
              {icon && (
                <span className="confirm-modal__icon">
                  {icon}
                </span>
              )}
              {message}
            </p>

            <div className="confirm-modal__actions">
              <button className="confirm-modal__btn confirm-modal__btn--left" onClick={onLeft}>
                {leftIcon && <span className="confirm-modal__btn-icon">{leftIcon}</span>}
                {leftLabel}
              </button>
              <button className="confirm-modal__btn confirm-modal__btn--right" onClick={onRight}>
                {rightIcon && <span className="confirm-modal__btn-icon">{rightIcon}</span>}
                {rightLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ConfirmModal
