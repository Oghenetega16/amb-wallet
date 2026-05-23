"use client";

import { useQuery } from "@tanstack/react-query";
import type { GlobalMarketData } from "@/app/api/global/route";

async function fetchGlobal(): Promise<GlobalMarketData> {
  const res = await fetch("/api/global");
  if (!res.ok) throw new Error(`Global fetch ${res.status}`);
  return res.json();
}

// Fallback shown while real data loads
const FALLBACK: GlobalMarketData = {
  total_market_cap_usd:    2_480_000_000_000,
  total_volume_usd:        98_000_000_000,
  btc_dominance:           52.4,
  eth_dominance:           17.2,
  market_cap_change_pct:   1.8,
  active_cryptocurrencies: 14_320,
};

export function useGlobalMarket() {
  return useQuery<GlobalMarketData>({
    queryKey:        ["global-market"],
    queryFn:         fetchGlobal,
    staleTime:       120_000,
    refetchInterval: 180_000,
    retry:           2,
    placeholderData: FALLBACK,
  });
}
