import { IconAlertTriangle, IconCheckCircle, IconInfo } from './Icons'

const config = {
  error:   { bg: 'rgba(244,63,94,0.1)',   border: 'rgba(244,63,94,0.25)',   text: '#fca5a5', Icon: IconAlertTriangle, iconColor: '#f43f5e' },
  success: { bg: 'rgba(34,211,165,0.1)',  border: 'rgba(34,211,165,0.25)',  text: '#6ee7b7', Icon: IconCheckCircle,   iconColor: '#22d3a5' },
  info:    { bg: 'rgba(96,80,248,0.1)',   border: 'rgba(96,80,248,0.25)',   text: '#c4b5fd', Icon: IconInfo,          iconColor: '#6050f8' },
}

export default function Alert({ variant = 'error', children }) {
  const { bg, border, text, Icon, iconColor } = config[variant] ?? config.error
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
      style={{ background: bg, border: `1px solid ${border}`, color: text }}
    >
      <Icon width={15} height={15} className="shrink-0 mt-0.5" style={{ color: iconColor }} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
