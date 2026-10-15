// In development the Vite proxy forwards /api/* to the backend,
// so VITE_API_BASE_URL should be left empty (or unset) in .env.local.
// In production set VITE_API_BASE_URL to the deployed backend origin.
const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function getToken() {
  return localStorage.getItem('cap_token')
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))

  if (res.status === 401) {
    // Token expired or invalid — force logout
    localStorage.removeItem('cap_token')
    localStorage.removeItem('cap_user')
    window.dispatchEvent(new Event('cap:session-expired'))
    const err = new Error(data.error ?? 'Session expired. Please sign in again.')
    err.status = 401
    throw err
  }

  if (!res.ok) {
    const fallback =
      res.status === 502 || res.status === 503
        ? 'Cannot reach the server. Make sure the backend is running and try again.'
        : `Request failed (${res.status})`
    const message = data.error ?? data.message ?? fallback
    const err = new Error(message)
    err.status = res.status
    err.details = data.details ?? null
    throw err
  }

  return data
}

export const api = {
  get:    (path)        => request('GET',   path),
  post:   (path, body)  => request('POST',  path, body),
  patch:  (path, body)  => request('PATCH', path, body),
}
