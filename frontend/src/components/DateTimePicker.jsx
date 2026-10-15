import { useState, useRef, useEffect, useLayoutEffect } from 'react'
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

function snapMinute(m) { return Math.floor(m / 15) * 15 }

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
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => onView(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))} aria-label="Previous month" style={navBtn} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
          <IconChevronLeft width={15} height={15} />
        </button>
        <span style={{ color: '#e8e6ff', fontWeight: 600, fontSize: 14 }}>
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </span>
        <button type="button" onClick={() => onView(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))} aria-label="Next month" style={navBtn} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
          <IconChevronRight width={15} height={15} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#5a5780', padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((cell, i) => {
          if (!cell.cur) {
            return <div key={i} style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#2e2b5a' }}>{cell.day}</div>
          }
          const cellDate   = startOfDay(new Date(view.getFullYear(), view.getMonth(), cell.day))
          const isToday    = cellDate.getTime() === today.getTime()
          const isSel      = selected && startOfDay(selected).getTime() === cellDate.getTime()
          const isDisabled = minDate && cellDate < startOfDay(minDate)
          return (
            <button
              key={i} type="button" disabled={isDisabled}
              onClick={() => onSelect(cellDate)}
              aria-label={`${MONTHS[view.getMonth()]} ${cell.day} ${view.getFullYear()}`}
              aria-pressed={isSel}
              style={{
                height: 34, borderRadius: 8,
                border: isToday && !isSel ? '1.5px solid rgba(96,80,248,0.55)' : '1.5px solid transparent',
                background: isSel ? '#6050f8' : 'transparent',
                color: isDisabled ? '#3d3a6a' : isSel ? '#fff' : isToday ? '#a09aff' : '#c8c4f0',
                fontSize: 12, fontWeight: isSel ? 700 : 400,
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

// ─── Custom time dropdown ─────────────────────────────────────────────────────
function TimeDropdown({ options, value, onChange, label }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos]   = useState(null)
  const btnRef          = useRef(null)
  const listRef         = useRef(null)

  function toggle() {
    if (open) { setOpen(false); return }
    const r = btnRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left })
    setOpen(true)
  }

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return
    function down(e) {
      if (!listRef.current?.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false)
    }
    function key(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [open])

  // Scroll selected item into view when list opens
  useLayoutEffect(() => {
    if (!open || !listRef.current) return
    const sel = listRef.current.querySelector('[aria-selected="true"]')
    sel?.scrollIntoView({ block: 'nearest' })
  }, [open])

  function pick(v) { onChange(v); setOpen(false) }

  function handleKeyDown(e) {
    if (!open) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() } return }
    const idx = options.indexOf(value)
    if (e.key === 'ArrowDown') { e.preventDefault(); pick(options[Math.min(idx + 1, options.length - 1)]) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); pick(options[Math.max(idx - 1, 0)]) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(false) }
  }

  return (
    <>
      <button
        ref={btnRef} type="button"
        aria-label={label} aria-haspopup="listbox" aria-expanded={open}
        onClick={toggle} onKeyDown={handleKeyDown}
        style={{
          background: open ? 'rgba(96,80,248,0.18)' : 'rgba(255,255,255,0.07)',
          border: `1px solid ${open ? 'rgba(96,80,248,0.6)' : 'rgba(255,255,255,0.14)'}`,
          borderRadius: 10, color: '#e8e6ff', fontSize: 15, fontWeight: 600,
          padding: '6px 10px', cursor: 'pointer', outline: 'none', minWidth: 58,
          transition: 'background 0.15s, border-color 0.15s',
        }}
      >
        {typeof value === 'number' ? pad(value) : value}
      </button>
      {open && pos && createPortal(
        <ul
          ref={listRef} role="listbox" aria-label={label}
          style={{
            position: 'fixed', zIndex: 999999,
            top: pos.top, left: pos.left,
            background: '#1c1a3f',
            border: '1px solid rgba(96,80,248,0.4)',
            borderRadius: 10,
            boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
            padding: '4px 0', margin: 0,
            listStyle: 'none',
            maxHeight: 180, overflowY: 'auto',
            minWidth: 64,
          }}
        >
          {options.map(opt => {
            const isSel = opt === value
            return (
              <li
                key={opt} role="option" aria-selected={isSel}
                onMouseDown={e => { e.preventDefault(); pick(opt) }}
                style={{
                  padding: '7px 16px', fontSize: 14, fontWeight: isSel ? 700 : 400,
                  color: isSel ? '#fff' : '#c8c4f0',
                  background: isSel ? '#6050f8' : 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'rgba(96,80,248,0.22)' }}
                onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'transparent' }}
              >
                {typeof opt === 'number' ? pad(opt) : opt}
              </li>
            )
          })}
        </ul>,
        document.body
      )}
    </>
  )
}

const HOURS = Array.from({ length: 24 }, (_, h) => h)
const MINUTE_VALS = MINUTES.map(Number)

function TimeSelect({ hour, minute, onHourChange, onMinuteChange }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: '#9490c0', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Time</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <TimeDropdown options={HOURS}       value={hour}   onChange={onHourChange}   label="Hour" />
        <span style={{ color: '#6050f8', fontWeight: 700, fontSize: 18, lineHeight: 1 }}>:</span>
        <TimeDropdown options={MINUTE_VALS} value={minute} onChange={onMinuteChange} label="Minute" />
      </div>
      <p style={{ fontSize: 11, color: '#5a5780', marginTop: 5 }}>
        Selected: <span style={{ color: '#e8e6ff', fontWeight: 600 }}>{pad(hour)}:{pad(minute)}</span>
      </p>
    </div>
  )
}

// ─── Popup ────────────────────────────────────────────────────────────────────
// Rendered into document.body via portal. The trigger's getBoundingClientRect()
// is captured synchronously at open time and passed as `anchor`. Position is
// then calculated in useLayoutEffect — which runs after the browser has
// committed the DOM and the popup has real offsetWidth/offsetHeight — avoiding
// the ResizeObserver/useEffect async timing race where dimensions are 0.
function Popup({ anchor, onClose, children }) {
  const popRef = useRef(null)
  const [pos, setPos] = useState(null) // null → hidden until measured

  // useLayoutEffect fires synchronously after DOM paint; offsetHeight is real.
  useLayoutEffect(() => {
    if (!popRef.current) return
    setPos(calcPos(anchor, popRef.current.offsetWidth, popRef.current.offsetHeight))
  }, [anchor])

  // Recalculate on resize / scroll
  useEffect(() => {
    function update() {
      if (!popRef.current) return
      setPos(calcPos(anchor, popRef.current.offsetWidth, popRef.current.offsetHeight))
    }
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [anchor])

  // Close on outside mousedown
  useEffect(() => {
    function down(e) {
      if (popRef.current && !popRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', down)
    return () => document.removeEventListener('mousedown', down)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    function key(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', key)
    return () => document.removeEventListener('keydown', key)
  }, [onClose])

  const style = pos
    ? { position: 'fixed', zIndex: 99999, top: pos.top, left: pos.left, maxHeight: pos.maxHeight, visibility: 'visible' }
    : { position: 'fixed', zIndex: 99999, top: 0, left: 0, visibility: 'hidden' }

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

function calcPos(anchor, pw, ph) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const GAP = 6
  const MARGIN = 8

  let left = anchor.left
  if (left + pw > vw - MARGIN) left = vw - pw - MARGIN
  if (left < MARGIN) left = MARGIN

  const spaceBelow = vh - anchor.bottom - GAP - MARGIN
  const spaceAbove = anchor.top - GAP - MARGIN

  // Prefer above when popup doesn't fully fit below, and there's more room above
  let top, maxHeight
  if (ph <= spaceBelow) {
    top = anchor.bottom + GAP
    maxHeight = spaceBelow
  } else if (ph <= spaceAbove) {
    top = anchor.top - ph - GAP
    maxHeight = spaceAbove
  } else if (spaceAbove >= spaceBelow) {
    top = Math.max(MARGIN, anchor.top - ph - GAP)
    maxHeight = spaceAbove
  } else {
    top = anchor.bottom + GAP
    maxHeight = spaceBelow
  }

  return { top, left, maxHeight }
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const popupBox = {
  background: '#1c1a3f',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 16,
  boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
  padding: 18,
  width: 320,
  boxSizing: 'border-box',
  overflowY: 'auto',
}

const navBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: 30, height: 30, borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  color: '#9490c0',
  border: 'none', cursor: 'pointer', transition: 'background 0.15s',
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DateTimePicker({ id, label, value, onChange, minValue }) {
  const [open, setOpen]     = useState(false)
  const [anchor, setAnchor] = useState(null) // viewport rect captured at open time
  const triggerRef          = useRef(null)

  const committed = parseLocal(value)

  const initDraft = () => {
    const base = committed ?? parseLocal(minValue) ?? new Date()
    const d = startOfDay(base)
    return {
      date:   d,
      hour:   committed ? committed.getHours()               : 9,
      minute: committed ? snapMinute(committed.getMinutes()) : 0,
      view:   new Date(d.getFullYear(), d.getMonth(), 1),
    }
  }
  const [draft, setDraft] = useState(initDraft)

  function openPicker() {
    // Capture the trigger's viewport rect synchronously — before any state
    // update causes a re-render that could shift the element.
    const rect = triggerRef.current.getBoundingClientRect()
    setAnchor({ top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right })
    setDraft(initDraft())
    setOpen(true)
  }

  function handleDaySelect(day) {
    setDraft(d => ({ ...d, date: day, view: new Date(day.getFullYear(), day.getMonth(), 1) }))
  }

  function handleApply() {
    const result = new Date(draft.date)
    result.setHours(draft.hour, draft.minute, 0, 0)
    onChange(toLocalISO(result))
    setOpen(false)
  }

  function handleCancel() { setOpen(false) }

  const minParsed  = parseLocal(minValue)
  const calMinDate = minParsed ? startOfDay(minParsed) : todayStart()

  const draftFull = new Date(draft.date)
  draftFull.setHours(draft.hour, draft.minute, 0, 0)
  const draftInvalid = minParsed && draftFull <= minParsed

  const displayValue = committed
    ? `${committed.getDate()} ${MONTHS[committed.getMonth()].slice(0,3)} ${committed.getFullYear()}, ${pad(committed.getHours())}:${pad(committed.getMinutes())}`
    : ''

  return (
    <div>
      {label && <label htmlFor={id} className="cap-label">{label}</label>}

      <button
        ref={triggerRef}
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

      {open && anchor && (
        <Popup anchor={anchor} onClose={handleCancel}>
          <Calendar
            selected={draft.date}
            minDate={calMinDate}
            view={draft.view}
            onView={fn => setDraft(d => ({ ...d, view: fn(d.view) }))}
            onSelect={handleDaySelect}
          />

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '12px 0' }} />

          <TimeSelect
            hour={draft.hour}
            minute={draft.minute}
            onHourChange={h => setDraft(d => ({ ...d, hour: h }))}
            onMinuteChange={m => setDraft(d => ({ ...d, minute: m }))}
          />

          <div style={{ margin: '10px 0 4px', padding: '7px 12px', borderRadius: 10, background: draftInvalid ? 'rgba(244,63,94,0.1)' : 'rgba(96,80,248,0.1)', border: `1px solid ${draftInvalid ? 'rgba(244,63,94,0.3)' : 'rgba(96,80,248,0.2)'}`, fontSize: 12, color: draftInvalid ? '#fca5a5' : '#a09aff', textAlign: 'center' }}>
            {draftInvalid
              ? 'End must be after start time'
              : <>{draftFull.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}{' · '}<strong style={{ color: '#e8e6ff' }}>{pad(draft.hour)}:{pad(draft.minute)}</strong></>
            }
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button type="button" onClick={handleCancel} className="cap-btn-secondary" style={{ flex: 1, fontSize: 13 }}>Cancel</button>
            <button type="button" onClick={handleApply} disabled={!!draftInvalid} className="cap-btn-primary" style={{ flex: 1, fontSize: 13 }}>Apply</button>
          </div>
        </Popup>
      )}
    </div>
  )
}
