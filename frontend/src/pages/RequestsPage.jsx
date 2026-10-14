import { useReducer, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { IconClipboard, IconRefresh } from '../components/Icons'

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

export default function RequestsPage() {
  const [state, dispatch] = useReducer(reducer, { status: 'loading', requests: [], error: '' })
  const [retryKey, retry] = useReducer((n) => n + 1, 0)

  useEffect(() => {
    dispatch({ type: 'LOADING' })
    api.get('/api/requests/mine')
      .then((d) => dispatch({ type: 'DONE', requests: d.requests }))
      .catch((e) => dispatch({ type: 'ERROR', error: e.message }))
  }, [retryKey])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="cap-page-title">My Access Requests</h1>
        <p className="text-sm mt-1" style={{ color: '#5a5780' }}>Track the status of all your submitted requests</p>
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

      {state.status === 'done' && state.requests.length === 0 && (
        <div className="cap-card py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(96,80,248,0.1)', border: '1px solid rgba(96,80,248,0.2)' }}>
            <IconClipboard width={24} height={24} style={{ color: '#6050f8' }} />
          </div>
          <p className="font-semibold" style={{ color: '#e8e6ff' }}>No requests yet</p>
          <p className="text-sm mt-1" style={{ color: '#5a5780' }}>
            <Link to="/resources" style={{ color: '#6050f8' }} className="hover:underline">Browse resources</Link> to submit your first request.
          </p>
        </div>
      )}

      {state.status === 'done' && state.requests.length > 0 && (
        <div className="cap-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Resource', 'Purpose', 'Start', 'End', 'Status'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5780', background: 'rgba(255,255,255,0.02)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.requests.map((r) => (
                  <tr key={r.id} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    <td className="px-5 py-4 font-medium" style={{ color: '#e8e6ff' }}>{r.resource_name}</td>
                    <td className="px-5 py-4 max-w-xs" style={{ color: '#9490c0' }}>
                      <span className="line-clamp-1" title={r.purpose}>{r.purpose}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap" style={{ color: '#9490c0' }}>{fmt(r.start_time)}</td>
                    <td className="px-5 py-4 whitespace-nowrap" style={{ color: '#9490c0' }}>{fmt(r.end_time)}</td>
                    <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
