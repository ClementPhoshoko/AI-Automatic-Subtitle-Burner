import axios from 'axios'
import { getFriendlyError } from '../utils/errors'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const raw = err.response?.data?.error || err.message || 'Network error'
    const friendly = getFriendlyError(raw)
    const error = new Error(friendly.message)
    error.title = friendly.title
    error.raw = raw
    return Promise.reject(error)
  }
)

/* ── Jobs ─────────────────────────────────────── */

export async function fetchJobs({ status, limit = 50, offset = 0 } = {}) {
  const params = { limit, offset }
  if (status) params.status = status
  const { data } = await api.get('/jobs', { params })
  return data
}

export async function fetchJob(id) {
  const { data } = await api.get(`/jobs/${id}`)
  return data
}

export async function uploadVideo(file, subtitleStyle = 'classic', onProgress) {
  const form = new FormData()
  form.append('video', file)
  form.append('subtitle_style', subtitleStyle)

  const { data } = await api.post('/jobs/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000,
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    },
  })
  return data
}

export async function deleteJob(id) {
  const { data } = await api.delete(`/jobs/${id}`)
  return data
}

export async function triggerProcess(id) {
  const { data } = await api.post(`/jobs/${id}/process`)
  return data
}

/* ── Queue ────────────────────────────────────── */

export async function fetchQueue() {
  const { data } = await api.get('/jobs/queue')
  return data
}

/* ── Subtitles ────────────────────────────────── */

export function getSubtitlesUrl(id) {
  return `${api.defaults.baseURL}/jobs/${id}/subtitles`
}

export async function downloadSubtitles(id, filename) {
  const res = await api.get(`/jobs/${id}/subtitles`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `${id}.srt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default api
