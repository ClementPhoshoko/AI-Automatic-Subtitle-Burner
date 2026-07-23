const FRIENDLY_MESSAGES = {
  'Network error': {
    title: 'Connection issue',
    message: 'Could not reach the server. Please check your connection and try again.',
  },
  'Failed to fetch jobs': {
    title: 'Could not load jobs',
    message: 'Something went wrong while loading your jobs. Please try again.',
  },
  'Failed to fetch job': {
    title: 'Could not load job',
    message: 'This job could not be loaded. It may have been deleted.',
  },
  'Job not found': {
    title: 'Job not found',
    message: 'This job does not exist or has been removed.',
  },
  'No video file provided': {
    title: 'No file selected',
    message: 'Please select a video file to upload.',
  },
  'Invalid file type': {
    title: 'Unsupported format',
    message: 'Please upload a video in MP4, MOV, MKV, or WebM format.',
  },
  'File too large': {
    title: 'File too large',
    message: 'The file exceeds the 50 MB limit. Please use a smaller video.',
  },
  'Failed to upload video to storage': {
    title: 'Upload failed',
    message: 'Could not save your video. Please try again.',
  },
  'Failed to create job': {
    title: 'Could not start processing',
    message: 'Your video was uploaded but we could not start processing. Please try again.',
  },
  'Failed to start processing': {
    title: 'Processing error',
    message: 'We could not begin processing your video. Please try again.',
  },
  'Failed to delete job': {
    title: 'Delete failed',
    message: 'Could not remove this job. Please try again.',
  },
  'Cannot process job with status': {
    title: 'Processing unavailable',
    message: 'This job cannot be processed right now.',
  },
  'Failed to fetch queue': {
    title: 'Queue unavailable',
    message: 'Could not load the queue. It will update shortly.',
  },
  'No subtitles available for this job': {
    title: 'Subtitles not ready',
    message: 'Subtitles have not been generated yet. Please wait for processing to complete.',
  },
  'FFprobe metadata failed': {
    title: 'Video analysis failed',
    message: 'We could not read the video file. It may be corrupted or in an unsupported format.',
  },
  'FFmpeg thumbnail failed': {
    title: 'Thumbnail error',
    message: 'Could not generate a preview image. Processing will continue.',
  },
  'FFmpeg audio extraction failed': {
    title: 'Audio extraction failed',
    message: 'Could not extract audio from the video. Please check the file and try again.',
  },
  'FFmpeg subtitle burn failed': {
    title: 'Subtitle burn failed',
    message: 'Could not add subtitles to the video. Please try again.',
  },
  'Storage upload failed': {
    title: 'Upload failed',
    message: 'Could not save the processed video. Please try again.',
  },
  'Transcription failed': {
    title: 'Transcription error',
    message: 'AI transcription could not complete. Please try again.',
  },
  'Too many uploads': {
    title: 'Rate limit reached',
    message: 'You have uploaded too many videos recently. Please wait a minute and try again.',
  },
}

const DEFAULT_MESSAGE = {
  title: 'Something went wrong',
  message: 'An unexpected error occurred. Please try again.',
}

export function getFriendlyError(error) {
  if (!error) return DEFAULT_MESSAGE

  const text = typeof error === 'string' ? error : error.message || ''

  for (const [key, value] of Object.entries(FRIENDLY_MESSAGES)) {
    if (text.includes(key)) return value
  }

  if (text.includes('413') || text.includes('payload too large')) {
    return FRIENDLY_MESSAGES['File too large']
  }

  if (text.includes('429')) {
    return FRIENDLY_MESSAGES['Too many uploads']
  }

  if (text.includes('500') || text.includes('Internal server error')) {
    return {
      title: 'Server error',
      message: 'The server encountered an issue. Please try again in a moment.',
    }
  }

  if (text.includes('Failed to fetch') || text.includes('NetworkError')) {
    return FRIENDLY_MESSAGES['Network error']
  }

  return { title: DEFAULT_MESSAGE.title, message: text || DEFAULT_MESSAGE.message }
}
