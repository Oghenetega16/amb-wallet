"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart2, Activity } from "lucide-react";
import { useGlobalMarket } from "@/hooks/useGlobalMarket";
import { formatCompactNumber, formatPercent } from "@/lib/utils";

export function GlobalMarketBar() {
  const { data, isLoading } = useGlobalMarket();

  const items = [
    {
      label: "Market Cap",
      value: data ? formatCompactNumber(data.total_market_cap_usd) : "—",
      sub:   data ? formatPercent(data.market_cap_change_pct) : null,
      up:    (data?.market_cap_change_pct ?? 0) >= 0,
    },
    {
      label: "24h Volume",
      value: data ? formatCompactNumber(data.total_volume_usd) : "—",
      sub:   null, up: true,
    },
    {
      label: "BTC Dominance",
      value: data ? `${data.btc_dominance.toFixed(1)}%` : "—",
      sub:   null, up: true,
    },
    {
      label: "ETH Dominance",
      value: data ? `${data.eth_dominance.toFixed(1)}%` : "—",
      sub:   null, up: true,
    },
    {
      label: "Active Coins",
      value: data ? data.active_cryptocurrencies.toLocaleString() : "—",
      sub:   null, up: true,
    },
  ];

  return (
    <div
      className="flex items-center gap-0 shrink-0 overflow-x-auto"
      style={{
        background: "#070e20",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        scrollbarWidth: "none",
      }}
    >
      {items.map(({ label, value, sub, up }, i) => (
        <div
          key={label}
          className="flex items-center gap-2 px-5 py-2 shrink-0 border-r"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <span className="text-[10px] uppercase tracking-widest whitespace-nowrap"
            style={{ color: "#3d5070" }}>
            {label}
          </span>
          <span className="text-xs font-semibold text-white whitespace-nowrap">
            {isLoading ? (
              <span className="inline-block w-12 h-3 rounded animate-pulse"
                style={{ background: "rgba(255,255,255,0.07)" }} />
            ) : value}
          </span>
          {sub && !isLoading && (
            <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${up ? "text-accent-green" : "text-accent-red"}`}>
              {up ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
              {sub}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
