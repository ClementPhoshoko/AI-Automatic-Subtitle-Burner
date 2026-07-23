import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiCpu, FiRefreshCw, FiShield } from 'react-icons/fi'
import starIcon from '../../assets/Symmetrical_gray_star_icon.png'
import playIcon from '../../assets/Frosted_UI_play_icon_with_accents.png'
import HowItWorksSection from '../../components/how-it-works/HowItWorksSection'
import SlideNotification from '../../components/slide_modal/SlideNotification'
import { uploadVideo } from '../../api/jobs'
import './Home.css'

const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm']
const ALLOWED_EXT = '.mp4,.mov,.mkv,.webm'
const MAX_SIZE = 50 * 1024 * 1024

function Home() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [notif, setNotif] = useState({ show: false, type: 'error', title: '', message: '' })
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const dragCount = useRef(0)

  const showError = (title, message) => {
    setNotif({ show: true, type: 'error', title, message })
  }

  const closeNotif = () => setNotif((prev) => ({ ...prev, show: false }))

  const validate = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      showError('Invalid file type', `Supported formats: MP4, MOV, MKV, WebM. Got "${file.name.split('.').pop()}".`)
      return false
    }
    if (file.size > MAX_SIZE) {
      showError('File too large', `Maximum allowed size is 50 MB. This file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`)
      return false
    }
    return true
  }

  const startUpload = useCallback(async (file) => {
    if (!validate(file)) return

    setUploading(true)
    setProgress(0)

    try {
      const job = await uploadVideo(file, 'classic', (p) => setProgress(p))
      navigate(`/jobs/${job.id}`)
    } catch (err) {
      showError(err.title || 'Upload failed', err.message || 'Something went wrong. Please try again.')
      setUploading(false)
      setProgress(0)
    }
  }, [navigate])

  const handleFile = useCallback((file) => {
    if (file) startUpload(file)
  }, [startUpload])

  const handleClick = () => {
    if (uploading) return
    inputRef.current?.click()
  }

  const handleChange = (e) => {
    handleFile(e.target.files?.[0])
    e.target.value = ''
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
    if (!uploading) handleFile(e.dataTransfer.files?.[0])
  }, [handleFile, uploading])

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
        <div
          className={`home-upload-zone ${uploading ? 'home-upload-zone--uploading' : ''}`}
          onClick={handleClick}
          role="button"
          tabIndex={0}
        >
          <img className="home-upload-icon" src={playIcon} alt="" />
          <p className="home-upload-prompt">
            {uploading ? 'Uploading...' : 'Drag & drop your video here'}
          </p>
          {!uploading && (
            <>
              <span className="home-upload-or">or</span>
              <button className="btn btn--md btn--secondary" type="button" onClick={(e) => { e.stopPropagation(); handleClick() }}>Browse Files</button>
            </>
          )}
          <p className="home-upload-info">Supports MP4, MOV, MKV, WebM (Max 50mb)</p>
          <input ref={inputRef} type="file" accept={ALLOWED_EXT} onChange={handleChange} hidden />
        </div>
        {uploading && (
          <div className="home-upload-progress">
            <div className="home-upload-progress__track">
              <div
                className="home-upload-progress__bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="home-upload-progress__label">{progress}%</span>
          </div>
        )}
      </div>

      <HowItWorksSection />

      <SlideNotification
        show={notif.show}
        type={notif.type}
        title={notif.title}
        message={notif.message}
        onClose={closeNotif}
      />
    </section>
  )
}

export default Home
