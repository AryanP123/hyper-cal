import type { Fill, FundingEvent } from '../api/hyperliquid'
import { dayKey, monthPrefix } from './time'

export type DayFill = {
  time: number
  coin: string
  dir: string
  closedPnl: number
  fee: number
  px: number
  sz: number
  side: string
}

export type DayPnl = {
  date: string
  realizedPnl: number
  fees: number
  funding: number
  net: number
  fills: DayFill[]
  fillCount: number
  fundingCount: number
}

export function aggregateDailyPnl(
  fills: Fill[],
  funding: FundingEvent[],
  timeZone: string,
): Map<string, DayPnl> {
  const days = new Map<string, DayPnl>()

  const ensure = (date: string): DayPnl => {
    let day = days.get(date)
    if (!day) {
      day = {
        date,
        realizedPnl: 0,
        fees: 0,
        funding: 0,
        net: 0,
        fills: [],
        fillCount: 0,
        fundingCount: 0,
      }
      days.set(date, day)
    }
    return day
  }

  for (const fill of fills) {
    const date = dayKey(fill.time, timeZone)
    const day = ensure(date)
    const closedPnl = Number(fill.closedPnl) || 0
    const fee = Number(fill.fee) || 0
    day.realizedPnl += closedPnl
    day.fees += fee
    day.fills.push({
      time: fill.time,
      coin: fill.coin,
      dir: fill.dir,
      closedPnl,
      fee,
      px: Number(fill.px) || 0,
      sz: Number(fill.sz) || 0,
      side: fill.side,
    })
  }

  for (const event of funding) {
    if (event.delta?.type !== 'funding') continue
    const date = dayKey(event.time, timeZone)
    const day = ensure(date)
    day.funding += Number(event.delta.usdc) || 0
    day.fundingCount += 1
  }

  for (const day of days.values()) {
    day.fillCount = day.fills.length
    day.net = day.realizedPnl - day.fees + day.funding
    day.fills.sort((a, b) => b.time - a.time)
  }

  return days
}

export type MonthStats = {
  net: number
  realizedPnl: number
  fees: number
  funding: number
  winDays: number
  lossDays: number
  flatDays: number
  tradeDays: number
  maxAbs: number
}

export function computeMonthStats(days: Map<string, DayPnl>, year: number, monthIndex: number): MonthStats {
  const prefix = monthPrefix(year, monthIndex)
  let net = 0
  let realizedPnl = 0
  let fees = 0
  let funding = 0
  let winDays = 0
  let lossDays = 0
  let flatDays = 0
  let maxAbs = 0

  for (const [date, day] of days) {
    if (!date.startsWith(prefix)) continue
    net += day.net
    realizedPnl += day.realizedPnl
    fees += day.fees
    funding += day.funding
    maxAbs = Math.max(maxAbs, Math.abs(day.net))
    if (day.net > 0.005) winDays += 1
    else if (day.net < -0.005) lossDays += 1
    else flatDays += 1
  }

  return {
    net,
    realizedPnl,
    fees,
    funding,
    winDays,
    lossDays,
    flatDays,
    tradeDays: winDays + lossDays + flatDays,
    maxAbs: maxAbs || 1,
  }
}
