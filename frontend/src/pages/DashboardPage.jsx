import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import Alert from '../components/Alert'
import { IconClipboard, IconCreditCard, IconBuilding, IconArrowRight, IconClock, IconShield, IconUser } from '../components/Icons'

function fmt(dt) {
  return new Date(dt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

function StatCard({ label, value, sub, gradientClass, icon: Icon }) {
  return (
    <div className="cap-card p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-6 translate-x-6" style={{ background: 'white' }} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-3xl font-bold" style={{ color: '#e8e6ff' }}>{value}</p>
          <p className="text-sm font-medium mt-1" style={{ color: '#9490c0' }}>{label}</p>
          {sub && <p className="text-xs mt-0.5" style={{ color: '#5a5780' }}>{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${gradientClass}`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <Icon width={20} height={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between py-3 animate-pulse" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="space-y-1.5">
        <div className="h-3.5 w-36 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="h-3 w-24 rounded" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div className="h-5 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  )
}

function Section({ title, to, linkLabel, loading, error, empty, children }) {
  return (
    <div className="cap-card">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="font-semibold text-sm" style={{ color: '#e8e6ff' }}>{title}</h2>
        {to && (
          <Link to={to} className="flex items-center gap-1 text-xs font-medium transition-colors" style={{ color: '#6050f8' }}>
            {linkLabel}
            <IconArrowRight width={11} height={11} />
          </Link>
        )}
      </div>
      <div className="px-5 py-2">
        {loading && [0, 1, 2].map((i) => <SkeletonRow key={i} />)}
        {!loading && error && <div className="py-3"><Alert variant="error">{error}</Alert></div>}
        {!loading && !error && empty && (
          <div className="py-8 text-center">
            <p className="text-sm" style={{ color: '#5a5780' }}>{empty}</p>
          </div>
        )}
        {!loading && !error && children}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [passes, setPasses] = useState([])
  const [loadingReq, setLoadingReq] = useState(true)
  const [loadingPass, setLoadingPass] = useState(true)
  const [errReq, setErrReq] = useState('')
  const [errPass, setErrPass] = useState('')

  useEffect(() => {
    api.get('/api/requests/mine')
      .then((d) => setRequests(d.requests.slice(0, 5)))
      .catch((e) => setErrReq(e.message))
      .finally(() => setLoadingReq(false))

    api.get('/api/passes/mine')
      .then((d) => setPasses(d.passes.slice(0, 5)))
      .catch((e) => setErrPass(e.message))
      .finally(() => setLoadingPass(false))
  }, [])

  const pending = requests.filter((r) => r.status === 'PENDING').length
  const approved = requests.filter((r) => r.status === 'APPROVED').length
  const activePasses = passes.filter((p) => p.status === 'ACTIVE').length

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="cap-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{ background: 'linear-gradient(135deg, rgba(96,80,248,0.15) 0%, rgba(74,161,232,0.08) 50%, rgba(219,108,247,0.08) 100%)' }} />
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-5" style={{ background: '#6050f8', filter: 'blur(40px)', transform: 'translate(30%, -30%)' }} />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#6050f8,#4a3de0)', boxShadow: '0 4px 16px rgba(96,80,248,0.4)' }}>
            <IconUser width={22} height={22} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: '#9490c0' }}>Welcome back</p>
            <h1 className="text-xl font-bold" style={{ color: '#e8e6ff' }}>{user?.name}</h1>
            <p className="text-xs mt-0.5" style={{ color: '#5a5780' }}>{user?.email}</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(96,80,248,0.15)', border: '1px solid rgba(96,80,248,0.25)' }}>
            <IconShield width={13} height={13} style={{ color: '#a090ff' }} />
            <span className="text-xs font-semibold" style={{ color: '#a090ff' }}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={IconClock}      label="Pending Requests" value={loadingReq ? '—' : pending}      gradientClass="stat-amber"  />
        <StatCard icon={IconClipboard}  label="Approved Requests" value={loadingReq ? '—' : approved}    gradientClass="stat-purple" />
        <StatCard icon={IconCreditCard} label="Active Passes"     value={loadingPass ? '—' : activePasses} gradientClass="stat-cyan"   />
      </div>

      {/* Data sections */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Section
          title="Recent Requests"
          to="/requests"
          linkLabel="View all"
          loading={loadingReq}
          error={errReq}
          empty={<>No requests yet. <Link to="/resources" style={{ color: '#6050f8' }} className="hover:underline">Browse resources →</Link></>}
        >
          {requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between py-3 last:pb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e8e6ff' }}>{r.resource_name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#5a5780' }}>{fmt(r.start_time)}</p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </Section>

        <Section
          title="Recent Passes"
          to="/passes"
          linkLabel="View all"
          loading={loadingPass}
          error={errPass}
          empty="No passes issued yet."
        >
          {passes.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3 last:pb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#e8e6ff' }}>{p.resource_name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#5a5780' }}>Until {fmt(p.valid_until)}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </Section>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/resources" className="cap-btn-primary">
          <IconBuilding width={15} height={15} />
          Browse Resources
        </Link>
        <Link to="/requests" className="cap-btn-secondary">
          <IconClipboard width={15} height={15} />
          My Requests
        </Link>
        <Link to="/passes" className="cap-btn-secondary">
          <IconCreditCard width={15} height={15} />
          My Passes
        </Link>
      </div>
    </div>
  )
}
