import { useRef, useState, useEffect, useCallback } from 'react'
import { FiCpu, FiRefreshCw, FiShield } from 'react-icons/fi'
import starIcon from '../../assets/Symmetrical_gray_star_icon.png'
import playIcon from '../../assets/Frosted_UI_play_icon_with_accents.png'
import HowItWorksSection from '../../components/how-it-works/HowItWorksSection'
import './Home.css'

function Home() {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const dragCount = useRef(0)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCount.current++
    if (dragCount.current === 1) setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCount.current--
    if (dragCount.current === 0) setDragging(false)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCount.current = 0
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const dt = new DataTransfer()
      dt.items.add(file)
      inputRef.current.files = dt.files
      inputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
    }
  }, [])

  useEffect(() => {
    const el = window
    el.addEventListener('dragenter', handleDragEnter)
    el.addEventListener('dragleave', handleDragLeave)
    el.addEventListener('dragover', handleDragOver)
    el.addEventListener('drop', handleDrop)
    return () => {
      el.removeEventListener('dragenter', handleDragEnter)
      el.removeEventListener('dragleave', handleDragLeave)
      el.removeEventListener('dragover', handleDragOver)
      el.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return (
    <section className="home">
      {dragging && (
        <div className="drop-overlay">
          <div className="drop-overlay__box">
            <span className="drop-overlay__corner drop-overlay__corner--tl" />
            <span className="drop-overlay__corner drop-overlay__corner--tr" />
            <span className="drop-overlay__corner drop-overlay__corner--bl" />
            <span className="drop-overlay__corner drop-overlay__corner--br" />
            <p className="drop-overlay__text">Drop your video here</p>
          </div>
        </div>
      )}
      <h1 className="home-heading">
        AI Subtitle Generation,<br />
        <span className="home-heading-accent">made simple.</span>
          <img className="home-star-icon" src={starIcon} alt="" />
      </h1>

      <p className="home-subtitle">
        Upload your video, let our AI handle the rest,
        and get accurate subtitles in minutes.
      </p>

      <div className="home-features">
        <span className="home-feature">
          <FiCpu className="home-feature-icon home-feature-icon--primary" size={16} />
          Powered by Google Gemini
        </span>
        <span className="home-feature">
          <FiRefreshCw className="home-feature-icon home-feature-icon--info" size={16} />
          Asynchronous Processing
        </span>
        <span className="home-feature">
          <FiShield className="home-feature-icon home-feature-icon--success" size={16} />
          Secure & Scalable Design
        </span>
      </div>

      <div className="home-upload glass-card">
        <div className="home-upload-zone" onClick={handleClick} role="button" tabIndex={0}>
          <img className="home-upload-icon" src={playIcon} alt="" />
          <p className="home-upload-prompt">Drag & drop your video here</p>
          <span className="home-upload-or">or</span>
          <button className="btn btn--md btn--secondary" type="button" onClick={(e) => { e.stopPropagation(); handleClick() }}>Browse Files</button>
          <p className="home-upload-info">Supports MP4, MOV, MKV, WebM (Max 50mb)</p>
          <input ref={inputRef} type="file" accept=".mp4,.mov,.mkv,.webm" hidden />
        </div>
      </div>

      <HowItWorksSection />
    </section>
  )
}

export default Home
