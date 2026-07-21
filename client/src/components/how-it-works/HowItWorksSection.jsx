import { motion } from 'framer-motion'
import WorkflowCard from './WorkflowCard'
import icon1 from '../../assets/1_Cloud_upload_icon_with_soft_gradient.png'
import icon2 from '../../assets/2_Mint_sparkle_icon_on_white_canvas.png'
import icon3 from '../../assets/3_Minimalistic_cloud_upload_icon.png'
import icon4 from '../../assets/4_Minimal_clapperboard_icon_with_play_symbol.png'
import icon5 from '../../assets/5_Minimalist_download_icon_with_soft_glow.png'
import './HowItWorksSection.css'

const STEPS = [
  { id: 1, iconSrc: icon1, title: 'Upload Video', description: 'Drag and drop or browse to upload your video.' },
  { id: 2, iconSrc: icon2, title: 'AI Processing', description: 'Our AI analyzes your video and prepares subtitle generation.' },
  { id: 3, iconSrc: icon3, title: 'Secure Processing', description: 'Your files are processed securely while subtitles are being generated.' },
  { id: 4, iconSrc: icon4, title: 'Generate Subtitles', description: 'Subtitles are generated and synchronized with your video automatically.' },
  { id: 5, iconSrc: icon5, title: 'Download', description: 'Preview, download, or share your completed video with subtitles.' },
]

function HowItWorksSection() {
  return (
    <motion.section
      className="how-section"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="how-title">How it Works</h2>

      <div className="how-track">
        <div className="how-line" aria-hidden="true" />
        <div className="how-cards">
          {STEPS.map((step, i) => (
            <WorkflowCard
              key={step.id}
              iconSrc={step.iconSrc}
              stepNumber={`0${step.id}`}
              title={step.title}
              description={step.description}
              index={i}
            />
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default HowItWorksSection
