import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import Spinner from '../components/Spinner'
import { IconShield, IconEye, IconEyeOff } from '../components/Icons'

const YEAR = new Date().getFullYear()

function AlertLight({ variant = 'error', children }) {
  const styles = {
    error:   { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' },
  }
  const s = styles[variant] ?? styles.error
  return (
    <div role="alert" className="rounded-xl px-4 py-3 text-sm" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
      {children}
    </div>
  )
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState([])
  const [loading, setLoading] = useState(false)

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors([])
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await api.post('/api/auth/register', form)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      if (err.details?.length) setFieldErrors(err.details)
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const pwStrength = form.password.length === 0 ? 0 : form.password.length < 8 ? 1 : form.password.length < 12 ? 2 : 3
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', '#f43f5e', '#f59e0b', '#22d3a5']

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-14 relative overflow-hidden" style={{ background: '#060818' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 60%, rgba(17,24,105,0.8) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(66,105,210,0.15) 0%, transparent 50%)' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4269d2,#2a3fa8)', boxShadow: '0 4px 16px rgba(66,105,210,0.5)' }}>
            <IconShield width={20} height={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-base leading-tight text-white">Campus Access Pass</p>
            <p className="text-xs" style={{ color: '#6898e8' }}>Enterprise Security Portal</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-5xl font-bold leading-tight text-white">
              Join the<br />
              <span style={{ color: '#6898e8' }}>campus</span><br />
              network.
            </h2>
            <p className="mt-5 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Create your account to request access to labs, equipment rooms, and project spaces across campus.
            </p>
          </div>
          <ul className="space-y-3">
            {['Request access to any campus resource', 'Track your request status in real time', 'View and present your digital passes', 'Secure role-based access control'].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(66,105,210,0.25)', border: '1px solid rgba(104,152,232,0.4)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#6898e8' }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>© {YEAR} Campus Access Pass</p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#4269d2,#2a3fa8)' }}>
              <IconShield width={16} height={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">Campus Access Pass</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
            <p className="text-slate-500 text-sm mt-2">Get started with your student portal</p>
          </div>

          {error && <div className="mb-5"><AlertLight variant="error">{error}</AlertLight></div>}
          {fieldErrors.length > 0 && (
            <div className="mb-5">
              <AlertLight variant="error">
                <ul className="space-y-0.5">{fieldErrors.map((d, i) => <li key={i}>{d.message}</li>)}</ul>
              </AlertLight>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full name</label>
              <input id="name" type="text" autoComplete="name" required value={form.name} onChange={set('name')} placeholder="Jane Smith" className="cap-input-light" />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email address</label>
              <input id="email" type="email" autoComplete="email" required value={form.email} onChange={set('email')} placeholder="you@university.edu" className="cap-input-light" />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 8 characters"
                  className="cap-input-light pr-11"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 transition-colors" style={{ color: '#94a3b8' }} aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: i <= pwStrength ? strengthColor[pwStrength] : '#e2e8f0' }} />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{strengthLabel[pwStrength]}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="cap-btn-login mt-2">
              {loading && <Spinner size={15} />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition-colors" style={{ color: '#4269d2' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
