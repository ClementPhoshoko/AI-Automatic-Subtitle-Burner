import { motion } from 'framer-motion'
import './WorkflowCard.css'

function WorkflowCard({ iconSrc, stepNumber, title, description, index }) {
  return (
    <motion.div
      className="workflow-card"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
      whileHover={{ y: -4 }}
    >
      <div className="workflow-card-icon-wrap">
        <img className="workflow-card-icon" src={iconSrc} alt="" />
      </div>
      <span className="workflow-card-step">{stepNumber}</span>
      <h3 className="workflow-card-title">{title}</h3>
      <p className="workflow-card-desc">{description}</p>
    </motion.div>
  )
}

export default WorkflowCard
