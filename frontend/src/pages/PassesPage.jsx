import { useReducer, useEffect, useState } from 'react'
import { api } from '../lib/api'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import StatusBadge from '../components/StatusBadge'
import { IconCreditCard, IconRefresh, IconX, IconShield, IconCalendar, IconBuilding } from '../components/Icons'

function fmt(dt) {
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING': return { status: 'loading', passes: [], error: '' }
    case 'DONE':    return { status: 'done', passes: action.passes, error: '' }
    case 'ERROR':   return { status: 'error', passes: [], error: action.error }
    default:        return state
  }
}

const statusDesc = {
  ACTIVE:  'This pass is currently valid and can be presented for access.',
  EXPIRED: 'This pass has expired and is no longer valid.',
  REVOKED: 'This pass has been revoked and is no longer valid.',
}

// REF3-inspired: each status gets a distinct header gradient
const headerStyle = {
  ACTIVE:  { bg: 'linear-gradient(135deg, #22d3a5 0%, #059669 100%)', glow: 'rgba(34,211,165,0.3)' },
  EXPIRED: { bg: 'linear-gradient(135deg, #4a4870 0%, #2e2b5a 100%)', glow: 'rgba(90,87,128,0.2)' },
  REVOKED: { bg: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', glow: 'rgba(244,63,94,0.3)' },
}

const cardBorderStyle = {
  ACTIVE:  'rgba(34,211,165,0.3)',
  EXPIRED: 'rgba(255,255,255,0.08)',
  REVOKED: 'rgba(244,63,94,0.3)',
}

function PassDetail({ pass, onClose }) {
  const hs = headerStyle[pass.status] ?? headerStyle.EXPIRED
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl" style={{ background: '#1c1a3f', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        {/* Credential header — REF3 style */}
        <div className="p-6 relative overflow-hidden" style={{ background: hs.bg, boxShadow: `0 8px 32px ${hs.glow}` }}>
          {/* Security pattern overlay */}
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.5) 8px, rgba(255,255,255,0.5) 9px)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <IconShield width={14} height={14} className="text-white/70" />
                <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Campus Access Pass</span>
              </div>
              <button onClick={onClose} className="text-white/60 hover:text-white p-1 rounded-lg transition-colors" style={{ background: 'rgba(0,0,0,0.15)' }} aria-label="Close">
                <IconX width={16} height={16} />
              </button>
            </div>
            <p className="text-white font-bold text-xl leading-tight">{pass.resource_name}</p>
            <p className="text-white/60 text-xs mt-1 font-mono tracking-wider">PASS-{String(pass.id).padStart(6, '0')}</p>
            <div className="mt-3">
              <StatusBadge status={pass.status} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <p className="text-xs rounded-xl px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#9490c0' }}>
            {statusDesc[pass.status]}
          </p>

          <dl className="space-y-3">
            {[
              { Icon: IconBuilding, label: 'Resource', value: pass.resource_name },
              { Icon: IconCalendar, label: 'Valid from', value: fmt(pass.valid_from) },
              { Icon: IconCalendar, label: 'Valid until', value: fmt(pass.valid_until) },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <dt className="flex items-center gap-2 text-xs shrink-0" style={{ color: '#5a5780' }}>
                  <Icon width={12} height={12} />
                  {label}
                </dt>
                <dd className="text-sm font-medium text-right" style={{ color: '#e8e6ff' }}>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="pt-1 text-center">
            <p className="text-xs" style={{ color: '#3d3a6a' }}>
              Present ID <span className="font-mono font-semibold" style={{ color: '#6050f8' }}>PASS-{String(pass.id).padStart(6, '0')}</span> to the verifier
            </p>
          </div>

          <button onClick={onClose} className="cap-btn-secondary w-full">Close</button>
        </div>
      </div>
    </div>
  )
}

function PassCard({ pass, onClick }) {
  const hs = headerStyle[pass.status] ?? headerStyle.EXPIRED
  const borderColor = cardBorderStyle[pass.status] ?? 'rgba(255,255,255,0.08)'
  return (
    <button
      onClick={onClick}
      className="text-left w-full overflow-hidden rounded-2xl transition-all duration-200 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
      style={{ background: '#1c1a3f', border: `1px solid ${borderColor}`, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,0,0,0.35), 0 0 0 1px ${borderColor}` }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.25)' }}
    >
      {/* Mini credential header */}
      <div className="h-2 w-full" style={{ background: hs.bg }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <IconShield width={16} height={16} style={{ color: pass.status === 'ACTIVE' ? '#22d3a5' : pass.status === 'REVOKED' ? '#f43f5e' : '#5a5780' }} />
          </div>
          <StatusBadge status={pass.status} />
        </div>
        <p className="font-semibold text-sm" style={{ color: '#e8e6ff' }}>{pass.resource_name}</p>
        <p className="text-xs mt-1 font-mono" style={{ color: '#3d3a6a' }}>PASS-{String(pass.id).padStart(6, '0')}</p>
        <p className="text-xs mt-2" style={{ color: '#5a5780' }}>Until {fmt(pass.valid_until)}</p>
        <p className="text-xs mt-3 font-medium" style={{ color: '#6050f8' }}>View details →</p>
      </div>
    </button>
  )
}

export default function PassesPage() {
  const [state, dispatch] = useReducer(reducer, { status: 'loading', passes: [], error: '' })
  const [retryKey, retry] = useReducer((n) => n + 1, 0)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    dispatch({ type: 'LOADING' })
    api.get('/api/passes/mine')
      .then((d) => dispatch({ type: 'DONE', passes: d.passes }))
      .catch((e) => dispatch({ type: 'ERROR', error: e.message }))
  }, [retryKey])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="cap-page-title">My Passes</h1>
        <p className="text-sm mt-1" style={{ color: '#5a5780' }}>Your issued digital access credentials</p>
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

      {state.status === 'done' && state.passes.length === 0 && (
        <div className="cap-card py-20 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(96,80,248,0.1)', border: '1px solid rgba(96,80,248,0.2)' }}>
            <IconCreditCard width={24} height={24} style={{ color: '#6050f8' }} />
          </div>
          <p className="font-semibold" style={{ color: '#e8e6ff' }}>No passes issued yet</p>
          <p className="text-sm mt-1" style={{ color: '#5a5780' }}>Passes are issued when an approver approves your request.</p>
        </div>
      )}

      {state.status === 'done' && state.passes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.passes.map((p) => (
            <PassCard key={p.id} pass={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {selected && <PassDetail pass={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
