const API_URL = 'https://api.hyperliquid.xyz/info'
const MAX_FILLS_PER_REQUEST = 2000
const LOOKBACK_MS = 90 * 24 * 60 * 60 * 1000

export type Fill = {
  coin: string
  px: string
  sz: string
  side: string
  time: number
  startPosition: string
  dir: string
  closedPnl: string
  hash: string
  oid: number
  crossed: boolean
  fee: string
  feeToken?: string
  builderFee?: string
  tid: number
}

export type FundingEvent = {
  time: number
  hash: string
  delta: {
    type: string
    coin: string
    usdc: string
    szi: string
    fundingRate: string
    nSamples?: number
  }
}

async function postInfo<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    throw new Error(`Hyperliquid API error: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export async function fetchFills(address: string, startTime: number, endTime = Date.now()): Promise<Fill[]> {
  const fills: Fill[] = []
  let cursor = startTime

  while (cursor <= endTime) {
    const batch = await postInfo<Fill[]>({
      type: 'userFillsByTime',
      user: address,
      startTime: cursor,
      endTime,
      aggregateByTime: true,
    })

    if (!batch.length) break

    fills.push(...batch)

    if (batch.length < MAX_FILLS_PER_REQUEST) break

    const lastTime = batch[batch.length - 1].time
    const next = lastTime + 1
    if (next <= cursor) break
    cursor = next
  }

  return fills
}

export async function fetchFunding(address: string, startTime: number): Promise<FundingEvent[]> {
  return postInfo<FundingEvent[]>({
    type: 'userFunding',
    user: address,
    startTime,
  })
}

export async function fetchWalletHistory(address: string): Promise<{ fills: Fill[]; funding: FundingEvent[] }> {
  const startTime = Date.now() - LOOKBACK_MS
  const [fills, funding] = await Promise.all([
    fetchFills(address, startTime),
    fetchFunding(address, startTime),
  ])
  return { fills, funding }
}

export function isValidAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim())
}

export function normalizeAddress(value: string): string {
  return value.trim().toLowerCase()
}
