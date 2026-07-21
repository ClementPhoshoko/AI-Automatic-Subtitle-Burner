const API_BASE = 'http://localhost:3001/api'

export async function fetchJobs({ status, limit = 10, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit, offset })
  if (status) params.set('status', status)
  const res = await fetch(`${API_BASE}/jobs?${params}`)
  if (!res.ok) throw new Error('Failed to fetch jobs')
  return res.json()
}
