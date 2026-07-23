import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiHome } from 'react-icons/fi'
import notFoundImg from '../../assets/Frustrated by broken data displays.png'
import './NotFound.css'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
}

function NotFound() {
  const navigate = useNavigate()

  return (
    <motion.section
      className="not-found"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div className="not-found__image-wrap" variants={fadeUp}>
        <img
          className="not-found__image"
          src={notFoundImg}
          alt="Page not found"
        />
      </motion.div>

      <motion.div className="not-found__content" variants={fadeUp}>
        <h1 className="not-found__title">Page not found</h1>
        <p className="not-found__desc">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
      </motion.div>

      <motion.div className="not-found__actions" variants={fadeUp}>
        <button className="not-found__btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={16} />
          Go Back
        </button>
        <button className="not-found__btn" onClick={() => navigate('/')}>
          <FiHome size={16} />
          Home
        </button>
      </motion.div>
    </motion.section>
  )
}

export default NotFound
