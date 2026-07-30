const DAY_KEYS = new Map<string, Intl.DateTimeFormat>()

function dayFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = DAY_KEYS.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    DAY_KEYS.set(timeZone, fmt)
  }
  return fmt
}

/** YYYY-MM-DD in the given IANA timezone */
export function dayKey(ms: number, timeZone: string): string {
  return dayFormatter(timeZone).format(new Date(ms))
}

export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function listTimeZones(): string[] {
  try {
    const zones = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.(
      'timeZone',
    )
    if (zones?.length) return zones
  } catch {
    /* fall through */
  }
  return [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Australia/Sydney',
  ]
}

export function monthLabel(year: number, monthIndex: number, timeZone: string): string {
  const utc = Date.UTC(year, monthIndex, 15, 12)
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'long',
    year: 'numeric',
  }).format(new Date(utc))
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

/** Monday=0 … Sunday=6 for the 1st of the month (calendar grid starts Monday) */
export function startWeekdayMonday(year: number, monthIndex: number, timeZone: string): number {
  // Find a UTC instant that falls on the 1st in this timezone, then get weekday.
  // Probe noon UTC on the 1st and adjust if the local day rolled.
  let probe = Date.UTC(year, monthIndex, 1, 12)
  const key = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`
  for (let i = 0; i < 48; i++) {
    if (dayKey(probe, timeZone) === key) break
    probe += dayKey(probe, timeZone) < key ? 60 * 60 * 1000 : -60 * 60 * 1000
  }
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(new Date(probe))
  const map: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  }
  return map[weekday] ?? 0
}

export function todayKey(timeZone: string): string {
  return dayKey(Date.now(), timeZone)
}

export function formatMoney(value: number, digits = 2): string {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
  if (value > 0) return `+$${formatted}`
  if (value < 0) return `-$${formatted}`
  return `$${formatted}`
}

export function formatTime(ms: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(ms))
}

export function shiftMonth(year: number, monthIndex: number, delta: number): { year: number; monthIndex: number } {
  const d = new Date(Date.UTC(year, monthIndex + delta, 1))
  return { year: d.getUTCFullYear(), monthIndex: d.getUTCMonth() }
}

export function monthPrefix(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}
