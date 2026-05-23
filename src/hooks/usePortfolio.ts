"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useWalletStore } from "@/store/walletStore";
import type { Coin } from "@/types";

// ─── Types from Prisma (subset) ────────────────────────────────────────────
export interface DbHolding {
  id:          string;
  coinId:      string;
  symbol:      string;
  name:        string;
  quantity:    number;
  avgBuyPrice: number;
  updatedAt:   string;
}
export interface DbTransaction {
  id:         string;
  coinId:     string;
  symbol:     string;
  type:       string;
  quantity:   number;
  price:      number;
  usdValue:   number;
  fee:        number;
  cardLast4:  string | null;
  txHash:     string | null;
  status:     string;
  date:       string;
}
export interface DbPortfolio {
  id:           string;
  name:         string;
  holdings:     DbHolding[];
  transactions: DbTransaction[];
}

// ─── Enriched holding (DB + live price) ───────────────────────────────────
export interface EnrichedHolding extends DbHolding {
  currentPrice:     number;
  currentValue:     number;
  costBasis:        number;
  pnl:              number;
  pnlPct:           number;
  priceChangePct24h: number;
  color:            string;
  bgColor:          string;
  sparkline:        number[];
}

async function fetchPortfolio(): Promise<DbPortfolio> {
  const res = await fetch("/api/portfolio");
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  return res.json();
}

// ─── Main hook ─────────────────────────────────────────────────────────────
export function usePortfolio() {
  const { status } = useSession();
  const coins      = useWalletStore((s) => s.coins);

  const query = useQuery<DbPortfolio>({
    queryKey:        ["portfolio"],
    queryFn:         fetchPortfolio,
    enabled:         status === "authenticated",
    staleTime:       60_000,
    refetchInterval: 120_000,
  });

  // Enrich holdings with live prices from Zustand store
  const enriched: EnrichedHolding[] = (query.data?.holdings ?? []).map((h) => {
    const live: Coin | undefined = coins.find((c) => c.id === h.coinId);
    const currentPrice     = live?.price        ?? h.avgBuyPrice;
    const currentValue     = currentPrice * h.quantity;
    const costBasis        = h.avgBuyPrice * h.quantity;
    const pnl              = currentValue - costBasis;
    const pnlPct           = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    const priceChangePct24h = live?.priceChangePct24h ?? 0;
    return {
      ...h,
      currentPrice, currentValue, costBasis, pnl, pnlPct, priceChangePct24h,
      color:     live?.color     ?? "#a0a0a0",
      bgColor:   live?.bgColor   ?? "rgba(160,160,160,0.1)",
      sparkline: live?.sparkline ?? [],
    };
  });

  const totalValue    = enriched.reduce((s, h) => s + h.currentValue, 0);
  const totalCost     = enriched.reduce((s, h) => s + h.costBasis,    0);
  const totalPnL      = totalValue - totalCost;
  const totalPnLPct   = totalCost  > 0 ? (totalPnL / totalCost) * 100 : 0;

  return {
    ...query,
    holdings:     enriched,
    transactions: query.data?.transactions ?? [],
    totalValue,
    totalCost,
    totalPnL,
    totalPnLPct,
  };
}

// ─── Add transaction mutation ──────────────────────────────────────────────
export function useAddTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<DbTransaction> & { coinId: string; symbol: string; name?: string }) => {
      const res = await fetch("/api/portfolio/transactions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Transaction failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });
}
