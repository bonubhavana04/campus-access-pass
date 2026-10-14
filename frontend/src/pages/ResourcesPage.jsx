import { useReducer, useEffect, useState } from 'react'
import { api } from '../lib/api'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import { IconSearch, IconMapPin, IconTag, IconBuilding, IconRefresh, IconX, IconArrowRight } from '../components/Icons'

function toISOWithOffset(localDatetime) {
  const d = new Date(localDatetime)
  const off = -d.getTimezoneOffset()
  const sign = off >= 0 ? '+' : '-'
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${pad(off / 60)}:${pad(off % 60)}`
}

function listReducer(state, action) {
  switch (action.type) {
    case 'LOADING': return { status: 'loading', resources: [], error: '' }
    case 'DONE':    return { status: 'done', resources: action.resources, error: '' }
    case 'ERROR':   return { status: 'error', resources: [], error: action.error }
    default:        return state
  }
}

function RequestModal({ resource, onClose }) {
  const [form, setForm] = useState({ startTime: '', endTime: '', purpose: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) { return (e) => setForm((f) => ({ ...f, [field]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!form.startTime || !form.endTime || !form.purpose.trim()) { setError('All fields are required.'); return }
    if (form.purpose.trim().length < 5) { setError('Purpose must be at least 5 characters.'); return }
    const start = new Date(form.startTime)
    const end = new Date(form.endTime)
    if (end <= start) { setError('End time must be after start time.'); return }
    if (start <= new Date()) { setError('Start time must be in the future.'); return }
    setLoading(true)
    try {
      await api.post('/api/requests', {
        resourceId: resource.id,
        purpose: form.purpose.trim(),
        startTime: toISOWithOffset(form.startTime),
        endTime: toISOWithOffset(form.endTime),
      })
      setSuccess('Request submitted successfully.')
      setForm({ startTime: '', endTime: '', purpose: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: '#1c1a3f', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <h2 className="font-bold" style={{ color: '#e8e6ff' }}>Request Access</h2>
            <p className="text-sm mt-0.5" style={{ color: '#5a5780' }}>{resource.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors" style={{ color: '#5a5780' }} aria-label="Close">
            <IconX width={16} height={16} />
          </button>
        </div>

        <div className="p-6">
          {resource.location && (
            <div className="flex items-center gap-2 text-xs mb-5 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#9490c0' }}>
              <IconMapPin width={12} height={12} style={{ color: '#6050f8' }} />
              {resource.location}
              {resource.category && <><span className="mx-1.5" style={{ color: '#3d3a6a' }}>·</span><IconTag width={12} height={12} style={{ color: '#6050f8' }} />{resource.category}</>}
            </div>
          )}

          {error && <div className="mb-4"><Alert variant="error">{error}</Alert></div>}
          {success && <div className="mb-4"><Alert variant="success">{success}</Alert></div>}

          {!success ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="startTime" className="cap-label">Start</label>
                  <input id="startTime" type="datetime-local" required value={form.startTime} onChange={set('startTime')} className="cap-input text-xs" />
                </div>
                <div>
                  <label htmlFor="endTime" className="cap-label">End</label>
                  <input id="endTime" type="datetime-local" required value={form.endTime} onChange={set('endTime')} className="cap-input text-xs" />
                </div>
              </div>
              <div>
                <label htmlFor="purpose" className="cap-label">Purpose</label>
                <textarea id="purpose" required rows={3} value={form.purpose} onChange={set('purpose')} placeholder="Describe the reason for access…" className="cap-input resize-none" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={loading} className="cap-btn-primary flex-1">
                  {loading && <Spinner size={14} />}
                  {loading ? 'Submitting…' : 'Submit request'}
                </button>
                <button type="button" onClick={onClose} className="cap-btn-secondary px-4">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={onClose} className="cap-btn-primary w-full">Done</button>
          )}
        </div>
      </div>
    </div>
  )
}

function ResourceCard({ resource, onRequest }) {
  return (
    <div
      className="cap-card p-5 flex flex-col gap-4 transition-all duration-200"
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(96,80,248,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.35)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(96,80,248,0.15)', border: '1px solid rgba(96,80,248,0.2)' }}>
          <IconBuilding width={17} height={17} style={{ color: '#6050f8' }} />
        </div>
        {resource.category && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0" style={{ background: 'rgba(74,161,232,0.12)', border: '1px solid rgba(74,161,232,0.2)', color: '#4aa1e8' }}>
            {resource.category}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h2 className="font-semibold text-sm" style={{ color: '#e8e6ff' }}>{resource.name}</h2>
        {resource.location && (
          <p className="flex items-center gap-1.5 text-xs mt-1" style={{ color: '#5a5780' }}>
            <IconMapPin width={11} height={11} />
            {resource.location}
          </p>
        )}
        {resource.description && (
          <p className="text-sm mt-2 line-clamp-2 leading-relaxed" style={{ color: '#9490c0' }}>{resource.description}</p>
        )}
      </div>
      <button onClick={() => onRequest(resource)} className="cap-btn-primary w-full justify-center">
        Request Access
        <IconArrowRight width={14} height={14} />
      </button>
    </div>
  )
}

export default function ResourcesPage() {
  const [state, dispatch] = useReducer(listReducer, { status: 'loading', resources: [], error: '' })
  const [retryKey, retry] = useReducer((n) => n + 1, 0)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    dispatch({ type: 'LOADING' })
    api.get('/api/resources')
      .then((d) => dispatch({ type: 'DONE', resources: d.resources }))
      .catch((e) => dispatch({ type: 'ERROR', error: e.message }))
  }, [retryKey])

  const filtered = state.resources.filter((r) => {
    const q = search.toLowerCase()
    return r.name.toLowerCase().includes(q) || (r.category ?? '').toLowerCase().includes(q) || (r.location ?? '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="cap-page-title">Available Resources</h1>
          <p className="text-sm mt-1" style={{ color: '#5a5780' }}>Browse and request access to campus facilities</p>
        </div>
        <div className="relative w-full sm:w-72">
          <IconSearch width={14} height={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#5a5780' }} />
          <input type="search" placeholder="Search resources…" value={search} onChange={(e) => setSearch(e.target.value)} className="cap-input pl-9" aria-label="Search resources" />
        </div>
      </div>

      {state.status === 'loading' && (
        <div className="flex items-center justify-center py-20">
          <Spinner size={28} style={{ color: '#6050f8' }} />
        </div>
      )}

      {state.status === 'error' && (
        <div className="space-y-3">
          <Alert variant="error">{state.error}</Alert>
          <button onClick={retry} className="cap-btn-ghost"><IconRefresh width={14} height={14} />Try again</button>
        </div>
      )}

      {state.status === 'done' && filtered.length === 0 && (
        <div className="cap-card py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(96,80,248,0.1)', border: '1px solid rgba(96,80,248,0.2)' }}>
            <IconBuilding width={24} height={24} style={{ color: '#6050f8' }} />
          </div>
          <p className="font-semibold" style={{ color: '#e8e6ff' }}>No resources found</p>
          {search && <p className="text-sm mt-1" style={{ color: '#5a5780' }}>Try a different search term.</p>}
        </div>
      )}

      {state.status === 'done' && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => <ResourceCard key={r.id} resource={r} onRequest={setSelected} />)}
        </div>
      )}

      {selected && <RequestModal resource={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
