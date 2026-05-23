# AmbWallet — Crypto Portfolio Tracker

A production-grade cryptocurrency portfolio tracker built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Zustand**. Designed to impress recruiters with real-world interactivity, live price simulation, animated transitions, and a polished dark-navy UI.

---

## ✦ Features

- **Live price ticker** — animated scrolling bar with real-time simulated prices
- **Portfolio dashboard** — balance cards, sparkline charts, allocation donut, market pulse widget
- **Coins overview** — sortable asset list with live sparklines and P&L tracking
- **Transaction history** — filterable by type with status indicators
- **Statistics chart** — area chart with 1D / 1W / 1M / 3M / 1Y / ALL timeframes
- **Analytics page** — KPI strip, radar risk profile, monthly P&L bar chart, asset performance bars
- **Send & Receive modals** — full form validation, fee breakdown, animated QR code
- **Coin detail modal** — per-asset analytics, mini chart, key stats
- **Currencies page** — searchable, sortable full coin table with Trade actions
- **Payments page** — credit card management + full transaction history
- **Settings page** — toggles for security, notifications, preferences
- **Help page** — searchable FAQ accordion + live chat CTA
- **Notifications page** — mark read, delete, real-time notification list
- **Collapsible sidebar** — with smooth Framer Motion animation
- **Zustand global store** — with devtools, subscribeWithSelector middleware
- **TanStack Query** — configured for server-state caching
- **Page Visibility API** — auto-pauses live price updates when tab is hidden

---

## ✦ Tech Stack

| Layer         | Technology                                      |
|---------------|--------------------------------------------------|
| Framework     | Next.js 14 (App Router)                         |
| Language      | TypeScript (strict mode)                        |
| Styling       | Tailwind CSS v3 + custom theme                  |
| Animation     | Framer Motion 11                                |
| State (global)| Zustand 4 + devtools + subscribeWithSelector    |
| Server state  | TanStack React Query 5                          |
| Charts        | Recharts 2                                      |
| Icons         | Lucide React                                    |
| Typography    | Poppins (Google Fonts)                          |
| Notifications | react-hot-toast                                 |
| Utilities     | clsx, tailwind-merge, date-fns                  |

---

## ✦ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone / download
cd ambwallet

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

### Type check

```bash
npm run type-check
```

---

## ✦ Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + font + providers
│   ├── providers.tsx           # TanStack Query + Toast providers
│   ├── globals.css             # Tailwind base + global styles
│   ├── page.tsx                # Dashboard (/)
│   ├── DashboardClient.tsx     # Dashboard client component
│   ├── analytics/page.tsx      # Analytics (/analytics)
│   ├── currencies/page.tsx     # Currencies (/currencies)
│   ├── payments/page.tsx       # Payments (/payments)
│   ├── settings/page.tsx       # Settings (/settings)
│   ├── help/page.tsx           # Help (/help)
│   └── notifications/page.tsx  # Notifications (/notifications)
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Collapsible animated sidebar
│   │   ├── TopNav.tsx          # Sticky header with search + notifications
│   │   └── TickerBar.tsx       # Live scrolling price ticker
│   ├── dashboard/
│   │   ├── OverallCard.tsx     # Balance, send/receive, mini donuts
│   │   ├── CoinsCard.tsx       # Holdings with live sparklines
│   │   ├── HistoryCard.tsx     # Filterable transaction history
│   │   ├── StatsChart.tsx      # Area chart with TF switcher
│   │   ├── PortfolioAllocation.tsx  # Interactive donut + legend
│   │   └── MarketPulse.tsx     # Fear/greed gauge + top movers
│   └── modals/
│       ├── SendModal.tsx       # Full send form with validation
│       ├── ReceiveModal.tsx    # QR code + copy address
│       └── CoinDetailModal.tsx # Per-coin analytics modal
│
├── store/
│   └── walletStore.ts          # Zustand store (coins, txs, UI, actions)
│
├── hooks/
│   └── useLivePrices.ts        # SetInterval price ticker + Page Visibility
│
├── lib/
│   ├── mockData.ts             # Seed data, chart data, formatters
│   └── utils.ts                # cn(), formatters, Framer variants
│
└── types/
    └── index.ts                # Shared TypeScript interfaces
```

---

## ✦ Connecting Real Data

To replace mock data with live prices:

1. Sign up for [Polygon.io](https://polygon.io) or [CoinGecko](https://coingecko.com/api) (free tier available)
2. Add your API key to `.env.local`:
   ```
   NEXT_PUBLIC_COINGECKO_API_KEY=your_key_here
   ```
3. Create a `src/lib/api.ts` with a TanStack Query fetch using `useQuery`
4. Replace `useLivePrices` mock with a real WebSocket connection (Polygon.io offers crypto WebSocket feeds)

---

## ✦ Deployment

### Vercel (recommended)
```bash
npm install -g vercel
vercel
```

Add environment variables in the Vercel dashboard.

---

## ✦ Week-by-Week Build Plan

| Week | Focus |
|------|-------|
| 1 ✅ | Project setup, layout, dashboard cards, mock data, Zustand store |
| 2    | Real API integration (CoinGecko/Polygon.io), WebSocket ticker |
| 3    | Auth (NextAuth), persistent user portfolio, server-side data |
| 4    | AI insights panel (Claude API), rebalancing suggestions |
| 5    | Polish, mobile responsiveness, deploy, README, case study |

---

## ✦ License

MIT — free to use for your portfolio.
