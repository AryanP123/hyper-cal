import type { CSSProperties } from 'react'
import type { DayPnl } from '../lib/pnl'
import {
  daysInMonth,
  formatMoney,
  monthLabel,
  monthPrefix,
  shiftMonth,
  startWeekdayMonday,
  todayKey,
} from '../lib/time'

type Props = {
  year: number
  monthIndex: number
  timeZone: string
  days: Map<string, DayPnl>
  monthNet: number
  maxAbs: number
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onMonthChange: (year: number, monthIndex: number) => void
}

function cellStyle(net: number | undefined, maxAbs: number): CSSProperties {
  if (net === undefined || Math.abs(net) < 0.005) {
    return {}
  }
  const intensity = Math.min(0.78, 0.22 + (Math.abs(net) / maxAbs) * 0.56)
  if (net > 0) {
    return { background: `rgba(45, 212, 191, ${intensity})` }
  }
  return { background: `rgba(240, 113, 120, ${intensity})` }
}

export function PnlCalendar({
  year,
  monthIndex,
  timeZone,
  days,
  monthNet,
  maxAbs,
  selectedDate,
  onSelectDate,
  onMonthChange,
}: Props) {
  const totalDays = daysInMonth(year, monthIndex)
  const startPad = startWeekdayMonday(year, monthIndex, timeZone)
  const prefix = monthPrefix(year, monthIndex)
  const today = todayKey(timeZone)
  const cells: Array<{ date: string | null; dayNum: number | null }> = []

  for (let i = 0; i < startPad; i++) {
    cells.push({ date: null, dayNum: null })
  }
  for (let d = 1; d <= totalDays; d++) {
    const date = `${prefix}-${String(d).padStart(2, '0')}`
    cells.push({ date, dayNum: d })
  }

  const prev = shiftMonth(year, monthIndex, -1)
  const next = shiftMonth(year, monthIndex, 1)

  return (
    <section className="calendar">
      <div className="month-net-box">
        <span className="month-net-label">Month total net</span>
        <span className={`month-net-value mono ${monthNet >= 0 ? 'pos' : 'neg'}`}>
          {formatMoney(monthNet)}
        </span>
      </div>
      <header className="calendar-header">
        <button
          type="button"
          className="nav-btn"
          aria-label="Previous month"
          onClick={() => onMonthChange(prev.year, prev.monthIndex)}
        >
          ‹
        </button>
        <h2>{monthLabel(year, monthIndex, timeZone)}</h2>
        <button
          type="button"
          className="nav-btn"
          aria-label="Next month"
          onClick={() => onMonthChange(next.year, next.monthIndex)}
        >
          ›
        </button>
      </header>

      <div className="weekday-row" aria-hidden="true">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((cell, i) => {
          if (!cell.date) {
            return <div key={`pad-${i}`} className="day-cell empty" />
          }
          const day = days.get(cell.date)
          const net = day?.net
          const isSelected = selectedDate === cell.date
          const isToday = cell.date === today
          return (
            <button
              key={cell.date}
              type="button"
              className={[
                'day-cell',
                day ? 'has-data' : '',
                isSelected ? 'selected' : '',
                isToday ? 'today' : '',
                net !== undefined && net > 0.005 ? 'pos' : '',
                net !== undefined && net < -0.005 ? 'neg' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={cellStyle(net, maxAbs)}
              onClick={() => onSelectDate(cell.date!)}
            >
              <span className="day-num">{cell.dayNum}</span>
              <span className="day-pnl mono">
                {net !== undefined ? formatMoney(net, Math.abs(net) >= 100 ? 0 : 2) : '—'}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
