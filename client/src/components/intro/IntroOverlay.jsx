import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import logo from '../../assets/burner_logo_with_no_bg.png'
import './IntroOverlay.css'

function IntroOverlay({ onDone }) {
  const [phase, setPhase] = useState('intro')
  const [dockDelta, setDockDelta] = useState(null)
  const doneRef = useRef(false)

  const handleDone = useCallback(() => {
    if (!doneRef.current) {
      doneRef.current = true
      onDone()
    }
  }, [onDone])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('dock'), 2200)
    const t2 = setTimeout(() => setPhase('fade'), 3100)
    const t3 = setTimeout(handleDone, 3700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [handleDone])

  useEffect(() => {
    if (phase === 'dock') {
      requestAnimationFrame(() => {
        const brandEl = document.querySelector('.intro-brand')
        const navBrand = document.querySelector('.nav__left')
        if (brandEl && navBrand) {
          const b = brandEl.getBoundingClientRect()
          const n = navBrand.getBoundingClientRect()
          setDockDelta({
            x: n.left + n.width / 2 - (b.left + b.width / 2),
            y: n.top + n.height / 2 - (b.top + b.height / 2),
            scale: 0.6,
          })
        }
      })
    }
  }, [phase])

  const brandAnimate = () => {
    if (phase === 'intro') {
      return {
        opacity: 1,
        scale: [0.6, 2.8, 3.0, 2.6, 2.9, 2.7],
      }
    }
    if (dockDelta) {
      return {
        x: dockDelta.x,
        y: dockDelta.y,
        scale: dockDelta.scale,
        opacity: 1,
      }
    }
    return { opacity: 1, scale: 2.7 }
  }

  const brandTransition = () => {
    if (phase === 'intro') {
      return {
        duration: 2,
        times: [0, 0.25, 0.45, 0.65, 0.85, 1],
        ease: 'easeInOut',
      }
    }
    return {
      duration: 0.8,
      ease: 'easeOut',
    }
  }

  return (
    <motion.div
      className={`intro-overlay${phase === 'fade' ? ' intro-overlay--done' : ''}`}
      animate={phase === 'fade' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="intro-center">
        <motion.div
          className="intro-brand"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={brandAnimate()}
          transition={brandTransition()}
        >
          <img src={logo} alt="Burner" />
          <span>u r n e r</span>
        </motion.div>

        <motion.p
          className={`intro-tagline${phase === 'intro' ? ' intro-tagline--blink' : ''}`}
          initial={{ opacity: 0, y: 12 }}
          animate={phase !== 'intro' ? { opacity: 0, y: -8 } : { y: 0 }}
          transition={phase !== 'intro' ? { duration: 0.3, ease: 'easeOut' } : { duration: 0.01 }}
        >
          captions worth watching
        </motion.p>
      </div>
    </motion.div>
  )
}

export default IntroOverlay
