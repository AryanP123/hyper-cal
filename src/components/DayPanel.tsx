import type { DayPnl } from '../lib/pnl'
import { formatMoney, formatTime } from '../lib/time'

type Props = {
  day: DayPnl | null
  timeZone: string
  onClose: () => void
}

export function DayPanel({ day, timeZone, onClose }: Props) {
  if (!day) {
    return (
      <section className="day-panel empty-panel">
        <p>Select a day to see fills, fees, and funding.</p>
      </section>
    )
  }

  return (
    <section className="day-panel">
      <header className="day-panel-header">
        <div>
          <h3>{day.date}</h3>
          <p className="muted">Net after fees & funding</p>
        </div>
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close day detail">
          ×
        </button>
      </header>

      <div className="day-breakdown">
        <div>
          <span>Realized</span>
          <span className={`mono ${day.realizedPnl >= 0 ? 'pos' : 'neg'}`}>
            {formatMoney(day.realizedPnl)}
          </span>
        </div>
        <div>
          <span>Fees</span>
          <span className="mono neg">{formatMoney(-day.fees)}</span>
        </div>
        <div>
          <span>Funding</span>
          <span className={`mono ${day.funding >= 0 ? 'pos' : 'neg'}`}>
            {formatMoney(day.funding)}
          </span>
        </div>
        <div className="net-row">
          <span>Net</span>
          <span className={`mono ${day.net >= 0 ? 'pos' : 'neg'}`}>{formatMoney(day.net)}</span>
        </div>
      </div>

      <div className="fills-list">
        <h4>
          Fills <span className="muted">({day.fillCount})</span>
        </h4>
        {day.fills.length === 0 ? (
          <p className="muted">No fills this day (funding only).</p>
        ) : (
          <ul>
            {day.fills.slice(0, 80).map((fill, i) => (
              <li key={`${fill.time}-${fill.coin}-${i}`}>
                <div className="fill-top">
                  <span className="fill-coin">{fill.coin}</span>
                  <span className="fill-dir muted">{fill.dir}</span>
                  <span className="mono fill-time">{formatTime(fill.time, timeZone)}</span>
                </div>
                <div className="fill-bottom">
                  <span className="muted">
                    {fill.sz} @ {fill.px}
                  </span>
                  <span className={`mono ${fill.closedPnl - fill.fee >= 0 ? 'pos' : 'neg'}`}>
                    {formatMoney(fill.closedPnl - fill.fee)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {day.fills.length > 80 && (
          <p className="muted">Showing first 80 of {day.fills.length} fills.</p>
        )}
      </div>
    </section>
  )
}
