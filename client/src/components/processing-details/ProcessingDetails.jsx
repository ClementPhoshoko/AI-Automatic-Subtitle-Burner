import { FiList, FiCpu, FiX } from 'react-icons/fi'
import cloudIcon from '../../assets/1_Cloud_upload_icon_with_soft_gradient.png'
import sparkleIcon from '../../assets/2_Mint_sparkle_icon_on_white_canvas.png'
import downloadIcon from '../../assets/5_Minimalist_download_icon_with_soft_glow.png'
import heroImg from '../../assets/Soft tech play icon with cloud.png'
import './ProcessingDetails.css'

const DETAILS = [
  { label: 'AI Model', value: 'Google Gemini' },
  { label: 'Language', value: 'English (Default)' },
  { label: 'Audio Length', value: '02:45' },
  { label: 'File Size', value: '245.6 MB' },
  { label: 'Created At', value: 'May 18, 2024 . 10:21 AM' },
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

function ProcessingDetails({ onCancel }) {
  return (
    <div className="processing-details">
      <div className="processing-details__left">
        <div className="processing-details__header">
          <FiList className="processing-details__header-icon" />
          <h3 className="processing-details__title">Processing Details</h3>
        </div>

        <div className="processing-details__list">
          {DETAILS.map((item) => (
            <div key={item.label} className="processing-details__row">
              <span className="processing-details__label">{item.label}</span>
              <span className="processing-details__value">{item.value}</span>
            </div>
          ))}
        </div>

        <button className="processing-details__cancel" onClick={onCancel}>
          <FiX size={16} />
          Cancel Processing
        </button>
      </div>

      <div className="processing-details__right">
        <div className="processing-details__wait-header">
          <FiCpu className="processing-details__wait-icon" />
          <h3 className="processing-details__wait-title">While you wait</h3>
        </div>

        <p className="processing-details__wait-subtitle">
          Great things take a little time.
        </p>
        <p className="processing-details__wait-desc">
          Here's what's happening:
        </p>

        <div className="processing-details__steps">
          <div className="processing-details__steps-list">
            {STEPS.map((step, i) => (
              <div key={i} className="processing-details__step">
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
    </div>
  )
}

export default ProcessingDetails
