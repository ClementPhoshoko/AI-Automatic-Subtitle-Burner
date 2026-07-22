import { FiUploadCloud, FiCpu, FiDatabase, FiSettings, FiCheckCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import './WorkflowTimeline.css'

const DEFAULT_STAGES = [
  { id: 'uploaded', label: 'Uploaded', icon: FiUploadCloud },
  { id: 'ai-processing', label: 'AI Processing', icon: FiCpu },
  { id: 'storing', label: 'Storing', icon: FiDatabase },
  { id: 'finalizing', label: 'Finalizing', icon: FiSettings },
  { id: 'ready', label: 'Ready', icon: FiCheckCircle },
]

function WorkflowTimeline({ stages = DEFAULT_STAGES, currentStage = 0, failed = false }) {
  return (
    <div className="workflow-timeline">
      {stages.map((stage, index) => {
        const isCompleted = index < currentStage
        const isActive = index === currentStage
        const isPending = index > currentStage
        const isFailed = isActive && failed

        let statusClass = 'pending'
        if (isCompleted) statusClass = 'completed'
        if (isActive) statusClass = isFailed ? 'failed' : 'active'

        const IconComponent = stage.icon

        return (
          <div key={stage.id} className="workflow-timeline__stage">
            {index < stages.length - 1 && (
              <div className={`workflow-timeline__connector workflow-timeline__connector--${isCompleted ? 'completed' : isActive ? 'active' : 'pending'}`} />
            )}

            <motion.div
              className={`workflow-timeline__icon-wrap workflow-timeline__icon-wrap--${statusClass}`}
              initial={false}
              animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={isActive ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
            >
              <IconComponent className="workflow-timeline__icon" />
            </motion.div>

            <div className="workflow-timeline__info">
              <span className={`workflow-timeline__label workflow-timeline__label--${statusClass}`}>
                {stage.label}
              </span>
              <span className={`workflow-timeline__status workflow-timeline__status--${statusClass}`}>
                {isCompleted ? 'Done' : isFailed ? 'Failed' : isActive ? 'In progress' : 'Pending'}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WorkflowTimeline
