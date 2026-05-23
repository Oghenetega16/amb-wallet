// ─── Coin / Asset ──────────────────────────────────────────────────────────
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  priceChangePct24h: number;
  quantity: number;
  value: number;
  color: string;
  bgColor: string;
  sparkline: number[];
  high24h?: number;
  low24h?: number;
  marketCap?: number;
  volume24h?: number;
  allTimeHigh?: number;
}

// ─── Transaction ───────────────────────────────────────────────────────────
export type TxType = "sent" | "received" | "swap" | "buy";

export interface Transaction {
  id: string;
  type: TxType;
  asset: string;
  amount: number;
  usdValue: number;
  from?: string;
  to?: string;
  cardLast4?: string;
  date: string;           // ISO string
  status: "completed" | "pending" | "failed";
  hash?: string;
}

// ─── Portfolio ─────────────────────────────────────────────────────────────
export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPct: number;
  change24h: number;
  change24hPct: number;
  income: number;
  expenses: number;
}

// ─── Chart ─────────────────────────────────────────────────────────────────
export type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

export interface ChartPoint {
  time: string;
  value: number;
}

// ─── UI State ──────────────────────────────────────────────────────────────
export type ModalType = "send" | "receive" | "coinDetail" | null;
export type ActivePage = "dashboard" | "currencies" | "payments" | "settings";

// ─── Payment Card ──────────────────────────────────────────────────────────
export interface PaymentCard {
  id: string;
  last4: string;
  brand: "visa" | "mastercard" | "amex";
  expiry: string;
  holder: string;
  isDefault: boolean;
}

// ─── Utility ───────────────────────────────────────────────────────────────
export type Direction = "up" | "down";
