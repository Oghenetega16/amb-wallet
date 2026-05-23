/**
 * CoinGecko API client
 * Free tier: ~30 req/min, no API key required for basic endpoints.
 * All requests go through our own Next.js API routes to avoid CORS and
 * to centralise caching / rate-limit management.
 */

import type { CGMarketCoin, CGMarketChart, CGSimplePrice, ChartPoint } from "./types";

// ─── Coin universe ──────────────────────────────────────────────────────────
export const TRACKED_COINS = [
  "bitcoin",
  "ethereum",
  "litecoin",
  "solana",
  "ripple",
  "polkadot",
] as const;

export type CoinId = typeof TRACKED_COINS[number];

// ─── Visual metadata (static — not from API) ────────────────────────────────
export const COIN_META: Record<string, { color: string; bgColor: string; symbol: string; binanceSymbol: string }> = {
  bitcoin:  { color: "#f7931a", bgColor: "rgba(247,147,26,0.12)",  symbol: "BTC", binanceSymbol: "BTCUSDT"  },
  ethereum: { color: "#627eea", bgColor: "rgba(98,126,234,0.12)",  symbol: "ETH", binanceSymbol: "ETHUSDT"  },
  litecoin: { color: "#a0a0a0", bgColor: "rgba(160,160,160,0.12)", symbol: "LTC", binanceSymbol: "LTCUSDT"  },
  solana:   { color: "#9945ff", bgColor: "rgba(153,69,255,0.12)",  symbol: "SOL", binanceSymbol: "SOLUSDT"  },
  ripple:   { color: "#00aae4", bgColor: "rgba(0,170,228,0.12)",   symbol: "XRP", binanceSymbol: "XRPUSDT"  },
  polkadot: { color: "#e6007a", bgColor: "rgba(230,0,122,0.12)",   symbol: "DOT", binanceSymbol: "DOTUSDT"  },
};

// ─── Quantity held (would come from user auth in prod) ──────────────────────
export const COIN_HOLDINGS: Record<string, number> = {
  bitcoin:  0.038,
  ethereum: 0.612,
  litecoin: 5.2,
  solana:   1.65,
  ripple:   1500,
  polkadot: 25,
};

// ─── Days → CoinGecko param map ─────────────────────────────────────────────
export const TF_TO_DAYS: Record<string, string> = {
  "1D":  "1",
  "1W":  "7",
  "1M":  "30",
  "3M":  "90",
  "1Y":  "365",
  "ALL": "max",
};

// ─── Internal fetcher ───────────────────────────────────────────────────────
async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, {
    next: { revalidate: 30 },   // Next.js ISR — cache 30s on server
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown error");
    throw new Error(`API ${path} → ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** Fetch market data for all tracked coins via our API route */
export async function fetchMarketCoins(): Promise<CGMarketCoin[]> {
  return apiFetch<CGMarketCoin[]>("/api/coins");
}

/** Fetch OHLC chart data for a single coin via our API route */
export async function fetchCoinChart(
  coinId: string,
  days: string = "365"
): Promise<ChartPoint[]> {
  return apiFetch<ChartPoint[]>(`/api/coins/${coinId}/chart?days=${days}`);
}

/** Fetch current prices only (lightweight polling fallback) */
export async function fetchSimplePrices(): Promise<CGSimplePrice> {
  return apiFetch<CGSimplePrice>(
    `/api/coins/simple?ids=${TRACKED_COINS.join(",")}`
  );
}

// ─── Transform CoinGecko → our Coin shape ──────────────────────────────────
export function normaliseCoin(raw: CGMarketCoin) {
  const meta = COIN_META[raw.id] ?? {
    color: "#888",
    bgColor: "rgba(136,136,136,0.1)",
    symbol: raw.symbol.toUpperCase(),
    binanceSymbol: "",
  };

  const qty = COIN_HOLDINGS[raw.id] ?? 0;
  const sparkline = raw.sparkline_in_7d?.price ?? [];

  const price = raw.current_price ?? 0;

  return {
    id: raw.id,
    symbol: meta.symbol,
    name: raw.name,

    price,
    priceChange24h: raw.price_change_24h ?? 0,
    priceChangePct24h: raw.price_change_percentage_24h ?? 0,

    quantity: qty,
    value: price * qty,

    color: meta.color,
    bgColor: meta.bgColor,

    sparkline: sparkline.slice(-20),

    // ✅ IMPORTANT FIXES BELOW
    marketCap: raw.market_cap ?? 0,
    volume24h: raw.total_volume ?? 0,
    allTimeHigh: raw.ath ?? 0,
    high24h: raw.high_24h ?? 0,
    low24h: raw.low_24h ?? 0,
  };
}
