// Thin fetch wrapper. Sends the Sanctum token when logged in,
// otherwise the guest token, so the backend can enforce download limits.
const BASE = import.meta.env.VITE_API_URL || '/api'

export const session = {
  token: localStorage.getItem('el_token'),
  guest: localStorage.getItem('el_guest'),
}

export function saveSession(token, guest) {
  session.token = token || null
  session.guest = guest || null
  token ? localStorage.setItem('el_token', token) : localStorage.removeItem('el_token')
  guest ? localStorage.setItem('el_guest', guest) : localStorage.removeItem('el_guest')
}

export class ApiError extends Error {
  constructor(status, data) {
    const first = data?.errors ? Object.values(data.errors).flat()[0] : null
    super(first || data?.message || 'Something went wrong. Try again.')
    this.status = status
    this.data = data
  }
}

export async function api(path, { method = 'GET', body, params } = {}) {
  let url = BASE + path
  if (params) {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null))
    if ([...q].length) url += '?' + q
  }

  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (session.token) headers.Authorization = `Bearer ${session.token}`
  else if (session.guest) headers['X-Guest-Token'] = session.guest

  let res
  try {
    res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new ApiError(0, { message: 'Cannot reach the server. Check that the API is running.' })
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}
