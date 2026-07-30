# Hyper Cal

[hyper-cal.com](https://hyper-cal.com/)

**A free Hyperliquid PnL calendar that shows what you actually made — after fees and funding — in your timezone.**

Paste any wallet address. No login. No API key. No account.

Built for traders who were tired of calendars that say `+$10` when the account only moved `+$3` after Involio/builder fees ate the rest.

---

## Why this exists

Most Hyperliquid trackers show **gross / realized PnL**. That number ignores the painful part of high-leverage trading:

| What the tracker shows | What hit your wallet |
| --- | --- |
| Trade PnL `+$10.00` | Opening fee `-$3.04` |
| | Closing fee `-$3.04` |
| | Funding `-$0.20` |
| | **Real profit `+$3.72`** |

At 40x, fees are charged on the full notional — not your margin. A green day on a gross calendar can still be a red day in your account.

Other tools either:

- require signup / API keys, or
- group calendar days in **UTC**, so a 8:30pm ET close lands on the *next* day

Hyper Cal fixes both: **net PnL**, **your timezone**, **zero friction**.

---

## Features

- **Paste a wallet** — public Hyperliquid data only; nothing to sign up for
- **Net PnL calendar** — heatmapped month view (teal / coral)
- **Before fees vs after fees** — see the fee drag clearly
- **Funding included** — hourly perp funding counted into the day
- **Timezone control** — defaults to your browser; switch anytime
- **Day drill-down** — realized, fees, funding, and individual fills
- **Phone-friendly** — bookmark `?wallet=0x…` and open it like an app
- **Static & private** — runs in your browser; we don’t store wallets on a server

---

## How PnL is calculated

```text
Net = realized PnL − fees + funding
```

| Piece | Meaning |
| --- | --- |
| **Realized (before fees)** | Price PnL from closes on Hyperliquid fills |
| **Fees** | Total fill fees, **including builder fees** (e.g. Involio) |
| **Funding** | USDC paid or received while holding perps |
| **Net** | What actually changed in the account that day |

Days are grouped by the **close/fill timestamp converted to your selected timezone** — not forced UTC.

This is *true daily account change* (when cash hit the wallet). Same-day scalps match closed-trade journals closely; overnight holds attribute open fees to the open day.

---

## How to use

1. Paste a Hyperliquid address (`0x…`)
2. Hit **Load**
3. Set **Timezone** if you’re traveling or want ET/UTC/etc.
4. Browse the month — green/teal = net up, coral = net down
5. Tap a day for the full breakdown and fill list

Your last wallet and timezone are saved in the browser (`localStorage`) so the next visit is one click.

---

## Deploy (make it public)

This repo ships with a GitHub Actions workflow that publishes to **GitHub Pages**.

1. Push the repo to GitHub (name it `hyper-cal` so the `/hyper-cal/` base path matches)
2. **Settings → Pages → Source: GitHub Actions**
3. Push to `main` — the [deploy workflow](.github/workflows/deploy.yml) builds and goes live

If the repo name isn’t `hyper-cal`, change `base` in [`vite.config.ts`](vite.config.ts) (use `base: '/'` for a user/org root site).

---

## Stack

| Layer | Choice |
| --- | --- |
| UI | React + TypeScript + Vite |
| Data | [Hyperliquid public Info API](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) |
| Hosting | GitHub Pages (static, no backend) |
| Auth | None |

Formula inspired by how serious trackers define net PnL (`realized − fees + funding`), implemented entirely client-side so anyone can host a copy.

---

## Limits (honest ones)

- Hyperliquid only exposes roughly the **most recent ~10k fills** publicly; Hyper Cal loads about the **last 90 days** within that window
- Very active wallets may not get a full 90-day history in one load
- No trade reconstruction into multi-day “closed trade” journal rows (v1 focuses on daily account net)
- Not financial advice — numbers are derived from public exchange data

---

## Project layout

```text
src/
  api/hyperliquid.ts   # fills + funding fetch
  lib/pnl.ts           # net formula + day aggregation
  lib/time.ts          # timezone / calendar helpers
  components/          # wallet bar, calendar, day panel, stats
  App.tsx
  styles.css
```

---

## Contributing / remixing

Fork it, change the theme, point `base` at your own Pages URL, or extend it (closed-trade grouping, more history via a proxy, etc.). PRs that improve accuracy, timezone edge cases, or mobile UX are especially welcome.

---

**Hyper Cal** — see the number that matches your wallet, not the one that flatters the trade.
