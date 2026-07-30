import type { MonthStats as Stats } from '../lib/pnl'
import { formatMoney } from '../lib/time'

type Props = {
  stats: Stats
}

export function MonthStats({ stats }: Props) {
  return (
    <div className="month-stats">
      <div className="stat">
        <span className="stat-label">Month net</span>
        <span className={`stat-value mono ${stats.net >= 0 ? 'pos' : 'neg'}`}>
          {formatMoney(stats.net)}
        </span>
      </div>
      <div className="stat">
        <span className="stat-label">Before fees</span>
        <span className={`stat-value mono ${stats.realizedPnl >= 0 ? 'pos' : 'neg'}`}>
          {formatMoney(stats.realizedPnl)}
        </span>
      </div>
      <div className="stat">
        <span className="stat-label">Fees</span>
        <span className="stat-value mono neg">{formatMoney(-stats.fees)}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Funding</span>
        <span className={`stat-value mono ${stats.funding >= 0 ? 'pos' : 'neg'}`}>
          {formatMoney(stats.funding)}
        </span>
      </div>
      <div className="stat">
        <span className="stat-label">Days</span>
        <span className="stat-value mono">
          {stats.winDays}W / {stats.lossDays}L
        </span>
      </div>
    </div>
  )
}
