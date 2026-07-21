import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiSun } from 'react-icons/fi'
import { useTheme } from '../../contexts/ThemeContext'
import logo from '../../assets/burner_logo_with_no_bg.png'
import './Nav.css'

function Nav() {
  const { toggle } = useTheme()
  const navRef = useRef(null)
  const { scrollY } = useScroll()
  const raw = useTransform(scrollY, [0, 60], [0, 1], { clamp: true })
  const p = useSpring(raw, { stiffness: 260, damping: 28 })

  const glassState = useRef(false)

  useMotionValueEvent(p, 'change', (v) => {
    const el = navRef.current
    if (!el) return

    if (!glassState.current && v > 0.4) {
      glassState.current = true
      el.classList.add('nav--glass')
    } else if (glassState.current && v < 0.15) {
      glassState.current = false
      el.classList.remove('nav--glass')
    }
  })

  return (
    <motion.nav
      ref={navRef}
      className="nav"
      style={{
        paddingLeft: useTransform(p, [0, 1], [24, 32]),
        paddingRight: useTransform(p, [0, 1], [24, 32]),
      }}
    >
      <Link to="/" className="nav__left">
        <img className="nav__logo" src={logo} alt="Burner" />
        <span className="nav__title">u r n e r</span>
      </Link>
      <div className="nav__right">
        <button className="nav__theme-btn" onClick={toggle} title="Toggle theme">
          <FiSun size={18} />
        </button>
      </div>
    </motion.nav>
  )
}

export default Nav
