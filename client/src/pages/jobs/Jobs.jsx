import { FiCpu } from 'react-icons/fi'
import playIcon from '../../assets/Soft tech play icon with cloud.png'
import starIcon from '../../assets/Symmetrical_gray_star_icon.png'
import JobProgressCard from '../../components/job-progress-card/JobProgressCard'
import JobsQueue from '../../components/queue/JobsQueue'
import './Jobs.css'

function Jobs() {
  const job = {
    thumbnail: 'https://picsum.photos/seed/video1/640/360',
    title: 'My awesome travel montage 2026.mp4',
    format: 'MP4',
    resolution: '1920×1080',
    fileSize: '245 MB',
    duration: '12:34',
    status: 'processing',
    progress: 68,
    estimatedTime: '2 minutes remaining',
    workflowStage: 2,
    uploadTime: '2 min ago',
  }

  const queueJobs = [
    { id: 'job-1', userNumber: 8421, status: 'processing', position: 1 },
    { id: 'job-2', userNumber: 8422, status: 'processing', position: 2 },
    { id: 'job-3', userNumber: 8423, status: 'queued', position: 3 },
    { id: 'job-4', userNumber: 8424, status: 'queued', position: 4 },
    { id: 'job-5', userNumber: 8425, status: 'queued', position: 5 },
    { id: 'job-20', userNumber: 8440, status: 'queued', position: 20 },
  ]

  return (
    <section className="jobs">
      <div className="jobs-hero">
        <div className="jobs-hero__left">
          <h1 className="jobs-hero__title">
            <FiCpu className="jobs-hero__ai-icon" size={28} />
            Your video is<br />
            Being{' '}<span className="jobs-hero__accent">processed</span>
            <img className="jobs-hero__star-icon" src={starIcon} alt="" />.
          </h1>
          <p className="jobs-hero__desc">
            Sit back and relax! We're generating accurate subtitles for your video using Google Gemini.
          </p>
        </div>
        <div className="jobs-hero__right">
          <img className="jobs-hero__img" src={playIcon} alt="" />
        </div>
      </div>

      <div className="jobs-layout">
        <div className="jobs-layout__main">
          <JobProgressCard
            thumbnail={job.thumbnail}
            title={job.title}
            format={job.format}
            resolution={job.resolution}
            fileSize={job.fileSize}
            duration={job.duration}
            status={job.status}
            progress={job.progress}
            estimatedTime={job.estimatedTime}
            workflowStage={job.workflowStage}
            uploadTime={job.uploadTime}
          />
        </div>
        <div className="jobs-layout__sidebar">
          <JobsQueue
            jobs={queueJobs}
            estimatedWait="~3 minutes"
            currentUserId="job-20"
          />
        </div>
      </div>
    </section>
  )
}

export default Jobs
