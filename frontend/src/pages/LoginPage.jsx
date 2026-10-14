import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Spinner from '../components/Spinner'
import { IconShield, IconEye, IconEyeOff, IconCheckCircle } from '../components/Icons'

const YEAR = new Date().getFullYear()

function AlertLight({ variant = 'error', children }) {
  const styles = {
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', icon: '#ef4444' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', icon: '#22c55e' },
  }
  const s = styles[variant] ?? styles.error
  return (
    <div role="alert" className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      <IconCheckCircle width={15} height={15} className="shrink-0 mt-0.5" style={{ color: s.icon }} />
      <div>{children}</div>
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = location.state?.registered ?? false
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Email and password are required.'); return }
    setLoading(true)
    try {
      const data = await api.post('/api/auth/login', form)
      login(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — REF2 deep navy ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden" style={{ background: '#060818' }}>
        {/* Background layers matching REF2 */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(17,24,105,0.8) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(66,105,210,0.15) 0%, transparent 50%)' }} />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4269d2,#2a3fa8)', boxShadow: '0 4px 16px rgba(66,105,210,0.5)' }}>
            <IconShield width={20} height={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight text-white">Campus Access Pass</p>
            <p className="text-xs" style={{ color: '#6898e8' }}>Enterprise Security Portal</p>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-5xl font-bold leading-tight text-white">
              Secure.<br />
              <span style={{ color: '#6898e8' }}>Verified.</span><br />
              Trusted.
            </h2>
            <p className="mt-5 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Campus Access Pass provides role-based access control for labs, equipment rooms, seminar halls, and project spaces.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3">
            {[
              'Instant digital pass generation',
              'Real-time request tracking',
              'Role-based access control',
              'Cryptographic pass verification',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(66,105,210,0.25)', border: '1px solid rgba(104,152,232,0.4)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#6898e8' }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© {YEAR} Campus Access Pass</p>
      </div>

      {/* ── Right panel — white form ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4269d2,#2a3fa8)' }}>
              <IconShield width={16} height={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">Campus Access Pass</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Sign in</h1>
            <p className="text-slate-500 text-sm mt-2">Enter your credentials to access the portal</p>
          </div>

          {registered && <div className="mb-5"><AlertLight variant="success">Account created. Please sign in.</AlertLight></div>}
          {error && <div className="mb-5"><AlertLight variant="error">{error}</AlertLight></div>}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="you@university.edu"
                className="cap-input-light"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="cap-input-light pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 transition-colors"
                  style={{ color: '#94a3b8' }}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="cap-btn-login mt-2">
              {loading && <Spinner size={15} />}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold transition-colors" style={{ color: '#4269d2' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
