import type { Coin, Transaction, Portfolio, ChartPoint, PaymentCard, Timeframe } from "@/types";

// ─── Helpers ───────────────────────────────────────────────────────────────
function rnd(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function genSparkline(base: number, points = 20): number[] {
  return Array.from({ length: points }, (_, i) => {
    const drift = Math.sin(i / 3) * base * 0.04;
    const noise = (Math.random() - 0.5) * base * 0.02;
    return Math.max(0, base + drift + noise + (i / points) * base * 0.01);
  });
}

// ─── Coins ─────────────────────────────────────────────────────────────────
export const COINS: Coin[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: 68204.32,
    priceChange24h: -271.07,
    priceChangePct24h: -0.52,
    quantity: 0.038,
    value: 2591.76,
    color: "#f7931a",
    bgColor: "rgba(247,147,26,0.12)",
    sparkline: genSparkline(68204),
    marketCap: 1342000000000,
    volume24h: 28000000000,
    allTimeHigh: 73750,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: 3591.44,
    priceChange24h: 148.20,
    priceChangePct24h: 2.10,
    quantity: 0.612,
    value: 2197.96,
    color: "#627eea",
    bgColor: "rgba(98,126,234,0.12)",
    sparkline: genSparkline(3591),
    marketCap: 430000000000,
    volume24h: 14000000000,
    allTimeHigh: 4878,
  },
  {
    id: "litecoin",
    symbol: "LTC",
    name: "Litecoin",
    price: 83.91,
    priceChange24h: -5.05,
    priceChangePct24h: -0.71,
    quantity: 5.2,
    value: 436.33,
    color: "#a0a0a0",
    bgColor: "rgba(160,160,160,0.12)",
    sparkline: genSparkline(84),
    marketCap: 6200000000,
    volume24h: 380000000,
    allTimeHigh: 410,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: 171.84,
    priceChange24h: 8.42,
    priceChangePct24h: 3.40,
    quantity: 1.65,
    value: 283.54,
    color: "#9945ff",
    bgColor: "rgba(153,69,255,0.12)",
    sparkline: genSparkline(172),
    marketCap: 79000000000,
    volume24h: 3200000000,
    allTimeHigh: 260,
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "Ripple",
    price: 0.6218,
    priceChange24h: 0.0204,
    priceChangePct24h: 3.29,
    quantity: 1500,
    value: 932.70,
    color: "#00aae4",
    bgColor: "rgba(0,170,228,0.12)",
    sparkline: genSparkline(0.62),
    marketCap: 34000000000,
    volume24h: 1400000000,
    allTimeHigh: 3.84,
  },
  {
    id: "polkadot",
    symbol: "DOT",
    name: "Polkadot",
    price: 8.14,
    priceChange24h: -0.30,
    priceChangePct24h: -3.56,
    quantity: 25,
    value: 203.50,
    color: "#e6007a",
    bgColor: "rgba(230,0,122,0.12)",
    sparkline: genSparkline(8.14),
    marketCap: 11000000000,
    volume24h: 240000000,
    allTimeHigh: 55.09,
  },
];

// ─── Portfolio ─────────────────────────────────────────────────────────────
export const PORTFOLIO: Portfolio = {
  totalValue: 5610.00,
  totalCost: 4910.00,
  totalPnL: 700.00,
  totalPnLPct: 14.26,
  change24h: 148.40,
  change24hPct: 2.72,
  income: 1600.00,
  expenses: 800.00,
};

// ─── Transactions ──────────────────────────────────────────────────────────
export const TRANSACTIONS: Transaction[] = [
  { id: "tx1", type: "sent",     asset: "ETH", amount: 0.56,  usdValue: 2000, cardLast4: "3919", date: "2026-01-26T09:42:00Z", status: "completed", hash: "0x7fb4...c91a" },
  { id: "tx2", type: "received", asset: "BTC", amount: 0.015, usdValue: 1000, cardLast4: "3919", date: "2026-01-26T08:15:00Z", status: "completed", hash: "0x3ab1...f882" },
  { id: "tx3", type: "sent",     asset: "LTC", amount: 12,    usdValue: 2000, cardLast4: "3919", date: "2026-01-25T14:30:00Z", status: "completed", hash: "0x9cd2...a14e" },
  { id: "tx4", type: "sent",     asset: "SOL", amount: 2.9,   usdValue: 500,  cardLast4: "5541", date: "2026-01-24T11:00:00Z", status: "completed", hash: "0xf55b...7723" },
  { id: "tx5", type: "received", asset: "ETH", amount: 0.89,  usdValue: 3200, cardLast4: "3919", date: "2026-01-23T16:22:00Z", status: "completed", hash: "0x2be9...d409" },
  { id: "tx6", type: "swap",     asset: "BTC", amount: 0.022, usdValue: 800,  cardLast4: "5541", date: "2026-01-22T10:05:00Z", status: "completed", hash: "0xc77a...e551" },
  { id: "tx7", type: "buy",      asset: "SOL", amount: 5,     usdValue: 860,  cardLast4: "3919", date: "2026-01-21T09:00:00Z", status: "pending",   hash: "0x8441...bb02" },
];

// ─── Chart Data ─────────────────────────────────────────────────────────────
function genChartData(points: number, base: number, volatility = 0.04): ChartPoint[] {
  let val = base * 0.7;
  return Array.from({ length: points }, (_, i) => {
    val = val + (Math.random() - 0.45) * val * volatility + (base - val) * 0.05;
    return { time: `${i}`, value: Math.max(base * 0.5, val) };
  }).concat([{ time: `${points}`, value: base }]);
}

export const CHART_DATA: Record<Timeframe, ChartPoint[]> = {
  "1D":  [
    { time: "6am",  value: 5302 }, { time: "8am",  value: 5380 },
    { time: "10am", value: 5251 }, { time: "12pm", value: 5418 },
    { time: "2pm",  value: 5472 }, { time: "4pm",  value: 5390 },
    { time: "6pm",  value: 5524 }, { time: "8pm",  value: 5610 },
  ],
  "1W":  [
    { time: "Mon", value: 5104 }, { time: "Tue", value: 5221 },
    { time: "Wed", value: 5188 }, { time: "Thu", value: 5349 },
    { time: "Fri", value: 5296 }, { time: "Sat", value: 5482 },
    { time: "Sun", value: 5610 },
  ],
  "1M":  genChartData(30, 5610, 0.03),
  "3M":  genChartData(90, 5610, 0.04),
  "1Y":  [
    { time: "Jan", value: 3812 }, { time: "Feb", value: 3954 },
    { time: "Mar", value: 4210 }, { time: "Apr", value: 4102 },
    { time: "May", value: 4418 }, { time: "Jun", value: 4652 },
    { time: "Jul", value: 4498 }, { time: "Aug", value: 4801 },
    { time: "Sep", value: 5004 }, { time: "Oct", value: 5201 },
    { time: "Nov", value: 5398 }, { time: "Dec", value: 5610 },
  ],
  "ALL": genChartData(48, 5610, 0.05),
};

// ─── Payment Cards ──────────────────────────────────────────────────────────
export const PAYMENT_CARDS: PaymentCard[] = [
  { id: "card1", last4: "3919", brand: "visa",       expiry: "09/27", holder: "Oghenetega Sukuru", isDefault: true },
  { id: "card2", last4: "5541", brand: "mastercard", expiry: "04/26", holder: "Oghenetega Sukuru", isDefault: false },
];

// ─── Format helpers ────────────────────────────────────────────────────────
export function formatUSD(n: number, compact = false): string {
  if (compact && Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (compact && Math.abs(n) >= 1_000_000)     return `$${(n / 1_000_000).toFixed(2)}M`;
  if (compact && Math.abs(n) >= 1_000)         return `$${(n / 1_000).toFixed(2)}K`;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
}


