import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  IconShield, IconLayoutDashboard, IconBuilding, IconClipboard,
  IconCreditCard, IconCheckCircle, IconLogOut, IconMenu, IconX, IconUser,
} from './Icons'

const navByRole = {
  STUDENT: [
    { to: '/dashboard', label: 'Dashboard',       Icon: IconLayoutDashboard },
    { to: '/resources', label: 'Resources',       Icon: IconBuilding },
    { to: '/requests',  label: 'My Requests',     Icon: IconClipboard },
    { to: '/passes',    label: 'My Passes',       Icon: IconCreditCard },
  ],
  APPROVER: [
    { to: '/approver',  label: 'Pending Requests', Icon: IconClipboard },
  ],
  VERIFIER: [
    { to: '/verify',    label: 'Verify Pass',     Icon: IconCheckCircle },
  ],
  ADMIN: [
    { to: '/dashboard', label: 'Dashboard',       Icon: IconLayoutDashboard },
    { to: '/resources', label: 'Resources',       Icon: IconBuilding },
    { to: '/approver',  label: 'Requests',        Icon: IconClipboard },
    { to: '/verify',    label: 'Verify Pass',     Icon: IconCheckCircle },
  ],
}

const rolePill = {
  STUDENT:  'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  APPROVER: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
  VERIFIER: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  ADMIN:    'bg-amber-500/20 text-amber-300 border border-amber-500/30',
}

function SidebarContent({ links, user, onLogout, onClose }) {
  return (
    <div className="flex flex-col h-full" style={{ background: '#0d0f30' }}>
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#6050f8,#4a3de0)', boxShadow: '0 4px 12px rgba(96,80,248,0.4)' }}>
            <IconShield width={17} height={17} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: '#e8e6ff' }}>Campus Access</p>
            <p className="text-xs font-medium leading-tight" style={{ color: '#6050f8' }}>Security Portal</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors lg:hidden" style={{ color: '#5a5780' }} aria-label="Close menu">
            <IconX width={16} height={16} />
          </button>
        )}
      </div>

      {/* Nav label */}
      <div className="px-5 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#3d3a6a' }}>Navigation</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4" aria-label="Main navigation">
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive ? 'active-nav-item' : 'inactive-nav-item'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, rgba(96,80,248,0.25) 0%, rgba(96,80,248,0.1) 100%)',
              color: '#e8e6ff',
              border: '1px solid rgba(96,80,248,0.35)',
              boxShadow: '0 2px 8px rgba(96,80,248,0.15)',
            } : {
              color: '#6a6890',
              border: '1px solid transparent',
            }}
          >
            {({ isActive }) => (
              <>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
                  style={isActive ? { background: 'rgba(96,80,248,0.3)' } : { background: 'rgba(255,255,255,0.04)' }}>
                  <Icon width={14} height={14} style={{ color: isActive ? '#a090ff' : '#4a4870' }} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="px-3 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(96,80,248,0.2)', border: '1px solid rgba(96,80,248,0.3)' }}>
            <IconUser width={14} height={14} style={{ color: '#a090ff' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate" style={{ color: '#e8e6ff' }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: '#5a5780' }}>{user?.email}</p>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md shrink-0 ${rolePill[user?.role] ?? 'bg-white/10 text-white/60'}`}>
            {user?.role}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          style={{ color: '#5a5780', border: '1px solid transparent' }}
          onMouseEnter={e => { e.currentTarget.style.color='#f43f5e'; e.currentTarget.style.background='rgba(244,63,94,0.08)'; e.currentTarget.style.borderColor='rgba(244,63,94,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.color='#5a5780'; e.currentTarget.style.background=''; e.currentTarget.style.borderColor='transparent' }}
        >
          <IconLogOut width={15} height={15} />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = navByRole[user?.role] ?? []
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#090c2b' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 fixed inset-y-0 left-0 z-30" style={{ background: '#0d0f30', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <SidebarContent links={links} user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <SidebarContent links={links} user={user} onLogout={handleLogout} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-20 px-4 h-14 flex items-center justify-between" style={{ background: '#0d0f30', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg transition-colors" style={{ color: '#6a6890' }} aria-label="Open menu">
            <IconMenu width={20} height={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6050f8,#4a3de0)' }}>
              <IconShield width={12} height={12} className="text-white" />
            </div>
            <span className="font-bold text-sm" style={{ color: '#e8e6ff' }}>Campus Access Pass</span>
          </div>
          <div className="w-9" />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
