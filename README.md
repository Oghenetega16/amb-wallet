# AmbWallet — Crypto Portfolio Tracker

> A production-grade, real-time cryptocurrency portfolio dashboard built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand, Prisma, and NextAuth.js.

**Live:** [ambwallet.vercel.app](https://ambwallet.vercel.app)

---

## ✦ Features

| Feature | Stack |
|---|---|
| Live price streaming | Binance WebSocket |
| Real-time charts with timeframe selector | Recharts + CoinGecko API |
| AI portfolio insights (streaming) | Claude (Anthropic SDK) |
| Authentication (email + Google OAuth) | NextAuth.js v4 |
| Persistent portfolio + holdings CRUD | Prisma + SQLite/PostgreSQL |
| Animated UI + mobile responsive | Framer Motion + Tailwind CSS |
| Global market stats bar | CoinGecko `/global` endpoint |
| Portfolio allocation donut | Recharts PieChart |
| Fear & Greed gauge + top movers | Market Pulse widget |
| Send/Receive crypto modals | Zustand + DB persistence |
| Transaction history | Prisma + TanStack Query |
| Protected routes | Next.js Middleware |

---

## ✦ Tech Stack

```
Framework:     Next.js 14 (App Router, RSC)
Language:      TypeScript (strict)
Styling:       Tailwind CSS v3
Animation:     Framer Motion 11
Global state:  Zustand 4 + devtools
Server state:  TanStack React Query 5
Charts:        Recharts 2
Icons:         Lucide React
Font:          Poppins (Google Fonts)
Database:      Prisma ORM + SQLite (dev) / PostgreSQL (prod)
Auth:          NextAuth.js v4 + bcryptjs
AI:            Anthropic Claude (claude-sonnet-4)
Prices:        CoinGecko REST API + Binance WebSocket
Deployment:    Vercel
```

---

## ✦ Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Clone and install
```bash
git clone https://github.com/yourusername/ambwallet.git
cd ambwallet
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-min-32-chars"   # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."               # console.anthropic.com
COINGECKO_API_KEY=""                         # optional, free tier works
```

### 3. Set up database
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 4. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials:**
- Email: `oghenetegasukuru@ambwallet.com`
- Password: `password123`

---

## ✦ Deploy to Vercel

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "feat: initial ambwallet"
git remote add origin https://github.com/yourusername/ambwallet.git
git push -u origin main
```

### 2. Connect to Vercel
- Import the repo at [vercel.com/new](https://vercel.com/new)
- Vercel auto-detects Next.js

### 3. Add environment variables in Vercel dashboard
```
DATABASE_URL          → PostgreSQL connection string (Vercel Postgres / Neon / Supabase)
NEXTAUTH_SECRET       → openssl rand -base64 32
NEXTAUTH_URL          → https://your-app.vercel.app
ANTHROPIC_API_KEY     → sk-ant-...
COINGECKO_API_KEY     → (optional)
```

### 4. Switch to PostgreSQL for production
In `prisma/schema.prisma`, change:
```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

Then redeploy. Vercel runs `prisma generate && prisma db push` automatically via `vercel.json`.

---

## ✦ Project Structure

```
src/
├── app/
│   ├── (auth)/                  # Sign in, Sign up pages
│   ├── api/
│   │   ├── ai/insights/         # Claude streaming endpoint
│   │   ├── auth/                # NextAuth + register
│   │   ├── coins/               # CoinGecko proxy (prices + charts)
│   │   ├── global/              # Market stats proxy
│   │   └── portfolio/           # Holdings + transactions CRUD
│   ├── analytics/               # Analytics dashboard
│   ├── currencies/              # Full coin market view
│   ├── payments/                # Payment methods + tx log
│   ├── portfolio/               # Holdings management
│   ├── settings/                # User preferences
│   ├── help/                    # FAQ + support
│   └── notifications/           # Notification centre
├── components/
│   ├── dashboard/               # All dashboard widgets
│   ├── layout/                  # Sidebar, TopNav, TickerBar
│   ├── modals/                  # Send, Receive, CoinDetail, AddHolding
│   └── ui/                      # Skeleton, ErrorState, UserMenu, WsStatus
├── hooks/                       # useCoins, usePortfolio, useBinanceWebSocket…
├── store/                       # Zustand wallet store
├── lib/                         # Prisma client, utils, mockData, API helpers
├── types/                       # TypeScript interfaces
└── middleware.ts                 # Route protection
prisma/
├── schema.prisma                # DB schema
└── seed.ts                      # Demo data
```

---

## ✦ Architecture Notes

**Data flow:**
1. On mount, `useCoins` fetches CoinGecko via `/api/coins`, hydrates Zustand store
2. `useBinanceWebSocket` opens a multi-stream WS connection → pushes price ticks into store via `updateCoinPriceById`
3. All UI reads from Zustand — single source of truth, zero prop drilling
4. Portfolio data (`usePortfolio`) fetches from the DB and enriches each holding with live prices from Zustand
5. AI Insights builds a prompt from real portfolio state and streams Claude's response token by token

**Auth flow:**
1. `middleware.ts` protects all routes — unauthenticated requests redirect to `/auth/signin`
2. NextAuth JWT strategy — session data available client-side without DB round-trips
3. `SessionProvider` wraps the app — `useSession()` available everywhere

---

## ✦ Portfolio Piece Write-up

**Problem:** Most crypto trackers are either too simple (just price lists) or too complex (full trading platforms). AmbWallet fills the middle — a professional portfolio manager with real-time data, AI insights, and persistent user accounts.

**Technical depth:**
- WebSocket reconnection with exponential back-off and Page Visibility API pause
- Streaming AI responses parsed into structured sections client-side, with per-token animation
- Zustand store with `recomputePortfolio` runs on every price tick — O(n) where n = holdings count
- All external API calls are proxied server-side to protect keys and add cache headers
- Prisma upsert pattern for holdings ensures idempotent updates

**What it demonstrates:** Full-stack ownership — from database schema to WebSocket management to streamed AI integration to responsive UI — in a single cohesive product.

---

## ✦ License

MIT
