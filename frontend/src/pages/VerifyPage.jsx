import { useState } from 'react'
import { api } from '../lib/api'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import { IconCheckCircle, IconXCircle, IconShield, IconUser, IconBuilding, IconCalendar, IconRefresh } from '../components/Icons'

function fmt(dt) {
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function VerifyPage() {
  const [passId, setPassId] = useState('')
  const [resourceId, setResourceId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResult(null)
    const pid = parseInt(passId, 10)
    const rid = parseInt(resourceId, 10)
    if (!pid || pid <= 0 || !rid || rid <= 0) {
      setError('Enter valid Pass ID and Resource ID (positive integers).')
      return
    }
    setLoading(true)
    try {
      const data = await api.post('/api/passes/verify', { passId: pid, resourceId: rid })
      setResult({ granted: true, message: data.message, pass: data.pass })
    } catch (err) {
      if (err.status === 403) {
        setResult({ granted: false, message: err.message ?? 'ACCESS DENIED' })
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setResult(null)
    setError('')
    setPassId('')
    setResourceId('')
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="cap-page-title">Verify Access Pass</h1>
        <p className="text-sm mt-1" style={{ color: '#5a5780' }}>Enter pass details to verify access authorization</p>
      </div>

      {/* Input card */}
      <div className="cap-card p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#6050f8,#4a3de0)', boxShadow: '0 4px 16px rgba(96,80,248,0.4)' }}>
            <IconShield width={20} height={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#e8e6ff' }}>Pass Verification</p>
            <p className="text-xs" style={{ color: '#5a5780' }}>Backend-authoritative access check</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="passId" className="cap-label">Pass ID</label>
              <input
                id="passId"
                type="number"
                min="1"
                required
                value={passId}
                onChange={(e) => setPassId(e.target.value)}
                placeholder="e.g. 42"
                className="cap-input"
              />
            </div>
            <div>
              <label htmlFor="resourceId" className="cap-label">Resource ID</label>
              <input
                id="resourceId"
                type="number"
                min="1"
                required
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                placeholder="e.g. 3"
                className="cap-input"
              />
            </div>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <button type="submit" disabled={loading} className="cap-btn-primary w-full py-3">
            {loading ? <><Spinner size={15} />Verifying…</> : <><IconShield width={15} height={15} />Verify Access</>}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="overflow-hidden rounded-2xl" style={{ border: `1px solid ${result.granted ? 'rgba(34,211,165,0.3)' : 'rgba(244,63,94,0.3)'}`, boxShadow: `0 8px 32px ${result.granted ? 'rgba(34,211,165,0.15)' : 'rgba(244,63,94,0.15)'}` }}>
          {/* Result banner */}
          <div className="px-6 py-6 relative overflow-hidden" style={{ background: result.granted ? 'linear-gradient(135deg,#22d3a5,#059669)' : 'linear-gradient(135deg,#f43f5e,#be123c)' }}>
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.5) 8px, rgba(255,255,255,0.5) 9px)' }} />
            <div className="relative z-10 flex items-center gap-4">
              {result.granted
                ? <IconCheckCircle width={36} height={36} className="text-white shrink-0" />
                : <IconXCircle width={36} height={36} className="text-white shrink-0" />
              }
              <div>
                <p className="text-white font-bold text-2xl tracking-tight" aria-live="assertive">
                  {result.granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </p>
                <p className="text-white/75 text-sm mt-0.5">
                  {result.granted ? 'Pass is valid for this resource.' : 'Pass is not valid for this resource.'}
                </p>
              </div>
            </div>
          </div>

          {/* Pass details on grant */}
          {result.granted && result.pass && (
            <div className="p-6" style={{ background: '#1c1a3f' }}>
              <dl className="space-y-3">
                {[
                  { Icon: IconUser,     label: 'Student',     value: result.pass.studentName },
                  { Icon: IconBuilding, label: 'Resource',    value: result.pass.resource },
                  { Icon: IconCalendar, label: 'Valid from',  value: fmt(result.pass.validFrom) },
                  { Icon: IconCalendar, label: 'Valid until', value: fmt(result.pass.validUntil) },
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
            </div>
          )}

          {/* Denied details area */}
          {!result.granted && (
            <div className="px-6 py-4" style={{ background: '#1c1a3f' }}>
              <p className="text-sm text-center" style={{ color: '#9490c0' }}>{result.message}</p>
            </div>
          )}

          <div className="px-6 pb-5" style={{ background: '#1c1a3f' }}>
            <button onClick={reset} className="cap-btn-ghost w-full justify-center" style={{ color: '#9490c0' }}>
              <IconRefresh width={14} height={14} />
              Verify another pass
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
