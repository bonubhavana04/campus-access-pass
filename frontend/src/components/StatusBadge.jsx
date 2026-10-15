const config = {
  PENDING:  { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  text: '#fcd34d', dot: '#f59e0b' },
  APPROVED: { bg: 'rgba(34,211,165,0.15)',  border: 'rgba(34,211,165,0.3)',  text: '#6ee7b7', dot: '#22d3a5' },
  REJECTED: { bg: 'rgba(244,63,94,0.15)',   border: 'rgba(244,63,94,0.3)',   text: '#fca5a5', dot: '#f43f5e' },
  ACTIVE:   { bg: 'rgba(34,211,165,0.15)',  border: 'rgba(34,211,165,0.3)',  text: '#6ee7b7', dot: '#22d3a5' },
  EXPIRED:  { bg: 'rgba(148,144,192,0.12)', border: 'rgba(148,144,192,0.2)', text: '#9490c0', dot: '#5a5780' },
  REVOKED:  { bg: 'rgba(244,63,94,0.15)',   border: 'rgba(244,63,94,0.3)',   text: '#fca5a5', dot: '#f43f5e' },
}

const labels = {
  PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected',
  ACTIVE: 'Active', EXPIRED: 'Expired', REVOKED: 'Revoked',
}

export default function StatusBadge({ status }) {
  const { bg, border, text, dot } = config[status] ?? { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.15)', text: '#9490c0', dot: '#5a5780' }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: bg, border: `1px solid ${border}`, color: text }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} aria-hidden="true" />
      {labels[status] ?? status}
    </span>
  )
}
