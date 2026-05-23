"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchMarketCoins, fetchCoinChart, normaliseCoin, TF_TO_DAYS } from "@/lib/api/coingecko";
import { COINS as MOCK_COINS, CHART_DATA as MOCK_CHART } from "@/lib/mockData";
import { Coin } from "@/types";
import { useWalletStore } from "@/store/walletStore";
import type { Timeframe } from "@/types";
import type { ChartPoint } from "@/lib/api/types";

// ─── Query keys (centralised) ───────────────────────────────────────────────
export const QUERY_KEYS = {
  coins:     ["coins"] as const,
  chart:     (id: string, tf: Timeframe) => ["chart", id, tf] as const,
};

// ─── Coins ──────────────────────────────────────────────────────────────────
/**
 * Fetches all tracked coins from /api/coins.
 * On success, syncs the Zustand store.
 * On error, store keeps last-known state (mock data on first load).
 */
export function useCoins() {
  const setCoins = useWalletStore((s) => s.setCoins);

  const query = useQuery<Coin[]>({
    queryKey: QUERY_KEYS.coins,
    queryFn:  async () => {
      const raw  = await fetchMarketCoins();
      // fetchMarketCoins can throw if the route returns a non-200
      return raw.map(normaliseCoin);
    },
    staleTime:       30_000,     // treat as fresh for 30s
    refetchInterval: 60_000,     // background refetch every 60s
    retry:           2,
    retryDelay:      (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
    placeholderData: MOCK_COINS as Coin[], // show mock until first real fetch lands
  });

  // Sync successful data into Zustand
  useEffect(() => {
    if (query.data) setCoins(query.data);
  }, [query.data, setCoins]);

  return query;
}

// ─── Chart data ─────────────────────────────────────────────────────────────
/**
 * Fetches historical chart data for a single coin.
 * Falls back to MOCK_CHART on error.
 */
export function useCoinChart(coinId: string, timeframe: Timeframe) {
  const days = TF_TO_DAYS[timeframe] ?? "365";

  return useQuery<ChartPoint[]>({
    queryKey: QUERY_KEYS.chart(coinId, timeframe),
    queryFn:  () => fetchCoinChart(coinId, days),
    staleTime: timeframe === "1D" ? 60_000 : timeframe === "1W" ? 300_000 : 1_800_000,
    retry: 1,
    // Structured fallback: each timeframe falls back to its mock
    placeholderData: MOCK_CHART[timeframe] as ChartPoint[],
  });
}

// ─── Prefetch helper ────────────────────────────────────────────────────────
/**
 * Call this in the root layout to warm up the cache immediately.
 * Safe to call multiple times — TanStack deduplicates.
 */
export function usePrefetchCoins() {
  const qc = useQueryClient();
  useEffect(() => {
    qc.prefetchQuery({
      queryKey: QUERY_KEYS.coins,
      queryFn:  async () => (await fetchMarketCoins()).map(normaliseCoin),
      staleTime: 30_000,
    });
  }, [qc]);
}
