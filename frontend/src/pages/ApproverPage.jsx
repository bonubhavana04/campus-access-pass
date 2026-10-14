import { useReducer, useEffect, useState } from 'react'
import { api } from '../lib/api'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { IconClipboard, IconRefresh, IconCheck, IconX, IconUser, IconBuilding, IconClock } from '../components/Icons'

function fmt(dt) {
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING': return { status: 'loading', requests: [], error: '' }
    case 'DONE':    return { status: 'done', requests: action.requests, error: '' }
    case 'ERROR':   return { status: 'error', requests: [], error: action.error }
    default:        return state
  }
}

export default function ApproverPage() {
  const [state, dispatch] = useReducer(reducer, { status: 'loading', requests: [], error: '' })
  const [retryKey, retry] = useReducer((n) => n + 1, 0)
  const [deciding, setDeciding] = useState(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    dispatch({ type: 'LOADING' })
    api.get('/api/requests/pending')
      .then((d) => dispatch({ type: 'DONE', requests: d.requests }))
      .catch((e) => dispatch({ type: 'ERROR', error: e.message }))
  }, [retryKey])

  async function decide(id, decision) {
    setDeciding(id)
    setActionError('')
    try {
      await api.patch(`/api/requests/${id}/decision`, { decision })
      retry()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setDeciding(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="cap-page-title">Pending Requests</h1>
          <p className="text-sm mt-1" style={{ color: '#5a5780' }}>Review and action student access requests</p>
        </div>
        {state.status === 'done' && state.requests.length > 0 && (
          <span className="shrink-0 text-sm font-semibold px-3 py-1 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fcd34d' }}>
            {state.requests.length} pending
          </span>
        )}
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

      {actionError && <Alert variant="error">{actionError}</Alert>}

      {state.status === 'done' && state.requests.length === 0 && (
        <div className="cap-card py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(34,211,165,0.1)', border: '1px solid rgba(34,211,165,0.2)' }}>
            <IconClipboard width={24} height={24} style={{ color: '#22d3a5' }} />
          </div>
          <p className="font-semibold" style={{ color: '#e8e6ff' }}>All caught up!</p>
          <p className="text-sm mt-1" style={{ color: '#5a5780' }}>No pending requests to review.</p>
        </div>
      )}

      {state.status === 'done' && state.requests.length > 0 && (
        <div className="space-y-3">
          {state.requests.map((r) => (
            <div key={r.id} className="cap-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-semibold" style={{ color: '#e8e6ff' }}>{r.resource_name}</span>
                    <StatusBadge status="PENDING" />
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9490c0' }}>
                      <IconUser width={12} height={12} style={{ color: '#5a5780' }} />
                      {r.student_name}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9490c0' }}>
                      <IconBuilding width={12} height={12} style={{ color: '#5a5780' }} />
                      {r.resource_name}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9490c0' }}>
                      <IconClock width={12} height={12} style={{ color: '#5a5780' }} />
                      {fmt(r.start_time)} → {fmt(r.end_time)}
                    </span>
                  </div>
                  <p className="text-sm rounded-xl px-3 py-2.5 leading-relaxed" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#9490c0' }}>
                    <span className="text-xs font-semibold uppercase tracking-wider mr-2" style={{ color: '#5a5780' }}>Purpose:</span>
                    {r.purpose}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => decide(r.id, 'APPROVED')}
                    disabled={deciding === r.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50"
                    style={{ background: 'rgba(34,211,165,0.15)', border: '1px solid rgba(34,211,165,0.3)', color: '#22d3a5' }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background='rgba(34,211,165,0.25)' } }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(34,211,165,0.15)' }}
                  >
                    {deciding === r.id ? <Spinner size={13} /> : <IconCheck width={14} height={14} />}
                    Approve
                  </button>
                  <button
                    onClick={() => decide(r.id, 'REJECTED')}
                    disabled={deciding === r.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-50"
                    style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.25)', color: '#f43f5e' }}
                    onMouseEnter={e => { if (!e.currentTarget.disabled) { e.currentTarget.style.background='rgba(244,63,94,0.22)' } }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(244,63,94,0.12)' }}
                  >
                    <IconX width={14} height={14} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
