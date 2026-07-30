import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchWalletHistory,
  isValidAddress,
  normalizeAddress,
  type Fill,
  type FundingEvent,
} from './api/hyperliquid'
import { DayPanel } from './components/DayPanel'
import { MonthStats } from './components/MonthStats'
import { PnlCalendar } from './components/PnlCalendar'
import { TimezoneSelect } from './components/TimezoneSelect'
import { WalletBar } from './components/WalletBar'
import { aggregateDailyPnl, computeMonthStats, type DayPnl } from './lib/pnl'
import { getBrowserTimeZone, todayKey } from './lib/time'

const STORAGE_WALLET = 'hyper-cal:wallet'
const STORAGE_TZ = 'hyper-cal:timezone'

function readQueryWallet(): string | null {
  const params = new URLSearchParams(window.location.search)
  const w = params.get('wallet')
  return w && isValidAddress(w) ? normalizeAddress(w) : null
}

function initialWallet(): string {
  return readQueryWallet() || localStorage.getItem(STORAGE_WALLET) || ''
}

function initialTimeZone(): string {
  return localStorage.getItem(STORAGE_TZ) || getBrowserTimeZone()
}

function currentMonth(timeZone: string): { year: number; monthIndex: number } {
  const key = todayKey(timeZone)
  const [y, m] = key.split('-').map(Number)
  return { year: y, monthIndex: m - 1 }
}

function emptyDay(date: string): DayPnl {
  return {
    date,
    realizedPnl: 0,
    fees: 0,
    funding: 0,
    net: 0,
    fills: [],
    fillCount: 0,
    fundingCount: 0,
  }
}

export default function App() {
  const [walletInput, setWalletInput] = useState(initialWallet)
  const [loadedWallet, setLoadedWallet] = useState('')
  const [timeZone, setTimeZone] = useState(initialTimeZone)
  const [fills, setFills] = useState<Fill[]>([])
  const [funding, setFunding] = useState<FundingEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [{ year, monthIndex }, setMonth] = useState(() => currentMonth(initialTimeZone()))
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const days = useMemo(
    () => aggregateDailyPnl(fills, funding, timeZone),
    [fills, funding, timeZone],
  )
  const stats = useMemo(() => computeMonthStats(days, year, monthIndex), [days, year, monthIndex])
  const selectedDay = selectedDate ? (days.get(selectedDate) ?? emptyDay(selectedDate)) : null

  const loadWallet = useCallback(async (raw: string, tz = timeZone) => {
    const address = normalizeAddress(raw)
    if (!isValidAddress(address)) {
      setError('Enter a valid Hyperliquid wallet address (0x…).')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchWalletHistory(address)
      setFills(data.fills)
      setFunding(data.funding)
      setLoadedWallet(address)
      setWalletInput(address)
      localStorage.setItem(STORAGE_WALLET, address)

      const url = new URL(window.location.href)
      url.searchParams.set('wallet', address)
      window.history.replaceState({}, '', url.toString())

      const now = currentMonth(tz)
      setMonth(now)
      setSelectedDate(todayKey(tz))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }, [timeZone])

  useEffect(() => {
    const boot = initialWallet()
    if (boot && isValidAddress(boot)) {
      void loadWallet(boot, initialTimeZone())
    }
    // Boot once from URL / localStorage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_TZ, timeZone)
  }, [timeZone])

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />
      <header className="top">
        <div className="brand-block">
          <p className="brand">Hyper Cal</p>
          <p className="tagline">Net PnL after fees & funding — your timezone.</p>
        </div>
        <TimezoneSelect
          value={timeZone}
          onChange={(tz) => {
            setTimeZone(tz)
          }}
        />
      </header>

      <WalletBar
        value={walletInput}
        loading={loading}
        onChange={setWalletInput}
        onSubmit={() => void loadWallet(walletInput)}
      />

      {error && <p className="error-banner">{error}</p>}

      {loadedWallet && (
        <p className="loaded-meta mono">
          {loadedWallet.slice(0, 6)}…{loadedWallet.slice(-4)} · {fills.length} fills ·{' '}
          {funding.length} funding · last 90d
        </p>
      )}

      <MonthStats stats={stats} />

      <div className="main-layout">
        <PnlCalendar
          year={year}
          monthIndex={monthIndex}
          timeZone={timeZone}
          days={days}
          maxAbs={stats.maxAbs}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onMonthChange={(y, m) => setMonth({ year: y, monthIndex: m })}
        />
        <DayPanel
          day={selectedDay}
          timeZone={timeZone}
          onClose={() => setSelectedDate(null)}
        />
      </div>

      <footer className="footer">
        <p>
          Net = realized PnL − fees (incl. builder) + funding. Days use your selected timezone.
          Data from Hyperliquid public API. No login.
        </p>
      </footer>
    </div>
  )
}
