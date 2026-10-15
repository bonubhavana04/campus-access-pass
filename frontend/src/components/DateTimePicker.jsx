import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { IconCalendar, IconChevronLeft, IconChevronRight } from './Icons'

// ─── constants ───────────────────────────────────────────────────────────────
const DAYS   = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']
const MINUTES = ['00','15','30','45']

// ─── helpers ─────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0') }

function parseLocal(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

function toLocalISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function startOfDay(d) {
  const c = new Date(d); c.setHours(0,0,0,0); return c
}

function todayStart() { return startOfDay(new Date()) }

function snapMinute(m) {
  // snap to nearest 15-min slot (floor)
  return Math.floor(m / 15) * 15
}

// ─── Calendar ────────────────────────────────────────────────────────────────
function Calendar({ selected, minDate, view, onView, onSelect }) {
  const today = todayStart()

  const firstDay    = view.getDay()
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const daysInPrev  = new Date(view.getFullYear(), view.getMonth(), 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++)
    cells.push({ day: daysInPrev - firstDay + 1 + i, cur: false })
  for (let i = 1; i <= daysInMonth; i++)
    cells.push({ day: i, cur: true })
  while (cells.length < 42)
    cells.push({ day: cells.length - firstDay - daysInMonth + 1, cur: false })

  return (
    <div>
      {/* month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => onView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))}
          aria-label="Previous month"
          style={navBtn}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <IconChevronLeft width={15} height={15} />
        </button>
        <span style={{ color: '#e8e6ff', fontWeight: 600, fontSize: 14 }}>
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => onView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))}
          aria-label="Next month"
          style={navBtn}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
        >
          <IconChevronRight width={15} height={15} />
        </button>
      </div>

      {/* weekday headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#5a5780', padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      {/* day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          if (!cell.cur) {
            return (
              <div key={i} style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#2e2b5a' }}>
                {cell.day}
              </div>
            )
          }
          const cellDate  = startOfDay(new Date(view.getFullYear(), view.getMonth(), cell.day))
          const isToday   = cellDate.getTime() === today.getTime()
          const isSel     = selected && startOfDay(selected).getTime() === cellDate.getTime()
          const isDisabled = minDate && cellDate < startOfDay(minDate)

          return (
            <button
              key={i}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(cellDate)}
              aria-label={`${MONTHS[view.getMonth()]} ${cell.day} ${view.getFullYear()}`}
              aria-pressed={isSel}
              style={{
                height: 38,
                borderRadius: 8,
                border: isToday && !isSel ? '1.5px solid rgba(96,80,248,0.55)' : '1.5px solid transparent',
                background: isSel ? '#6050f8' : 'transparent',
                color: isDisabled ? '#3d3a6a' : isSel ? '#fff' : isToday ? '#a09aff' : '#c8c4f0',
                fontSize: 13,
                fontWeight: isSel ? 700 : 400,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (!isDisabled && !isSel) e.currentTarget.style.background = 'rgba(96,80,248,0.22)' }}
              onMouseLeave={e => { if (!isDisabled && !isSel) e.currentTarget.style.background = 'transparent' }}
            >
              {cell.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Time selects ─────────────────────────────────────────────────────────────
function TimeSelect({ hour, minute, onHourChange, onMinuteChange }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#9490c0', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
        Time
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <select
          value={hour}
          onChange={e => onHourChange(Number(e.target.value))}
          aria-label="Hour"
          style={selectStyle}
        >
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h}>{pad(h)}</option>
          ))}
        </select>
        <span style={{ color: '#6050f8', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>:</span>
        <select
          value={minute}
          onChange={e => onMinuteChange(Number(e.target.value))}
          aria-label="Minute"
          style={selectStyle}
        >
          {MINUTES.map(m => (
            <option key={m} value={Number(m)}>{m}</option>
          ))}
        </select>
      </div>
      <p style={{ fontSize: 11, color: '#5a5780', marginTop: 6 }}>
        Selected: <span style={{ color: '#e8e6ff', fontWeight: 600 }}>{pad(hour)}:{pad(minute)}</span>
      </p>
    </div>
  )
}

// ─── Popup (portal, fixed positioning) ───────────────────────────────────────
function Popup({ anchorRef, onClose, children }) {
  const popRef = useRef(null)
  const [style, setStyle] = useState({ visibility: 'hidden', position: 'fixed', zIndex: 99999 })

  useEffect(() => {
    function place() {
      if (!anchorRef.current || !popRef.current) return
      const a  = anchorRef.current.getBoundingClientRect()
      const pw = popRef.current.offsetWidth  || 340
      const ph = popRef.current.offsetHeight || 420
      const vw = window.innerWidth
      const vh = window.innerHeight
      const GAP = 6

      let top  = a.bottom + GAP
      let left = a.left

      // flip above if not enough room below
      if (top + ph > vh - 8) top = a.top - ph - GAP

      // clamp horizontally
      if (left + pw > vw - 8) left = vw - pw - 8
      if (left < 8) left = 8

      // clamp vertically (last resort)
      if (top < 8) top = 8

      setStyle({ visibility: 'visible', position: 'fixed', zIndex: 99999, top, left })
    }

    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [anchorRef])

  // close on outside click
  useEffect(() => {
    function down(e) {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) onClose()
    }
    document.addEventListener('mousedown', down)
    return () => document.removeEventListener('mousedown', down)
  }, [anchorRef, onClose])

  // close on Escape
  useEffect(() => {
    function key(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [onClose])

  return createPortal(
    <div
      ref={popRef}
      style={{ ...style, ...popupBox }}
      role="dialog"
      aria-modal="true"
      aria-label="Date and time picker"
      onMouseDown={e => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const popupBox = {
  background: '#1c1a3f',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 16,
  boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
  padding: 20,
  width: 340,
}

const navBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 32, height: 32, borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  color: '#9490c0',
  border: 'none', cursor: 'pointer', transition: 'background 0.15s',
}

const selectStyle = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 10,
  color: '#e8e6ff',
  fontSize: 15,
  fontWeight: 600,
  padding: '6px 10px',
  cursor: 'pointer',
  outline: 'none',
  minWidth: 58,
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DateTimePicker({ id, label, value, onChange, minValue }) {
  const [open, setOpen]       = useState(false)
  const anchorRef             = useRef(null)

  // committed value
  const committed = parseLocal(value)

  // draft state — only written to `value` on Apply
  const initDraft = () => {
    const base = committed ?? parseLocal(minValue) ?? new Date()
    const d = startOfDay(base)
    return {
      date:   d,
      hour:   committed ? committed.getHours()            : 9,
      minute: committed ? snapMinute(committed.getMinutes()) : 0,
      view:   new Date(d.getFullYear(), d.getMonth(), 1),
    }
  }
  const [draft, setDraft] = useState(initDraft)

  // reset draft whenever picker opens
  function openPicker() {
    setDraft(initDraft())
    setOpen(true)
  }

  function handleDaySelect(day) {
    setDraft(d => ({ ...d, date: day, view: new Date(day.getFullYear(), day.getMonth(), 1) }))
  }

  function handleHourChange(h) {
    setDraft(d => ({ ...d, hour: h }))
  }

  function handleMinuteChange(m) {
    setDraft(d => ({ ...d, minute: m }))
  }

  function handleApply() {
    const result = new Date(draft.date)
    result.setHours(draft.hour, draft.minute, 0, 0)
    onChange(toLocalISO(result))
    setOpen(false)
  }

  function handleCancel() {
    setOpen(false)
  }

  // build the minDate for the calendar
  const minParsed = parseLocal(minValue)
  const calMinDate = minParsed ? startOfDay(minParsed) : todayStart()

  // warn inside picker if draft datetime is not after minValue
  const draftFull = new Date(draft.date)
  draftFull.setHours(draft.hour, draft.minute, 0, 0)
  const draftInvalid = minParsed && draftFull <= minParsed

  // display in trigger button
  const displayValue = committed
    ? `${committed.getDate()} ${MONTHS[committed.getMonth()].slice(0,3)} ${committed.getFullYear()}, ${pad(committed.getHours())}:${pad(committed.getMinutes())}`
    : ''

  return (
    <div>
      {label && (
        <label htmlFor={id} className="cap-label">{label}</label>
      )}

      {/* trigger button */}
      <button
        ref={anchorRef}
        id={id}
        type="button"
        onClick={openPicker}
        className="cap-input"
        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'left' }}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconCalendar width={13} height={13} style={{ color: '#6050f8', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 12, color: displayValue ? '#e8e6ff' : '#5a5780', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayValue || 'Select date & time…'}
        </span>
      </button>

      {open && (
        <Popup anchorRef={anchorRef} onClose={handleCancel}>
          {/* calendar */}
          <Calendar
            selected={draft.date}
            minDate={calMinDate}
            view={draft.view}
            onView={fn => setDraft(d => ({ ...d, view: fn(d.view) }))}
            onSelect={handleDaySelect}
          />

          {/* divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '14px 0' }} />

          {/* time */}
          <TimeSelect
            hour={draft.hour}
            minute={draft.minute}
            onHourChange={handleHourChange}
            onMinuteChange={handleMinuteChange}
          />

          {/* preview + validation */}
          <div style={{ margin: '12px 0 4px', padding: '8px 12px', borderRadius: 10, background: draftInvalid ? 'rgba(244,63,94,0.1)' : 'rgba(96,80,248,0.1)', border: `1px solid ${draftInvalid ? 'rgba(244,63,94,0.3)' : 'rgba(96,80,248,0.2)'}`, fontSize: 12, color: draftInvalid ? '#fca5a5' : '#a09aff', textAlign: 'center' }}>
            {draftInvalid
              ? 'End must be after start time'
              : <>{draftFull.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}{' · '}<strong style={{ color: '#e8e6ff' }}>{pad(draft.hour)}:{pad(draft.minute)}</strong></>
            }
          </div>

          {/* actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" onClick={handleCancel} className="cap-btn-secondary" style={{ flex: 1, fontSize: 13 }}>
              Cancel
            </button>
            <button type="button" onClick={handleApply} disabled={!!draftInvalid} className="cap-btn-primary" style={{ flex: 1, fontSize: 13 }}>
              Apply
            </button>
          </div>
        </Popup>
      )}
    </div>
  )
}
