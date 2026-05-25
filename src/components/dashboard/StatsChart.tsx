"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { useCoinChart } from "@/hooks/useCoins";
import { ChartSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { fadeUp } from "@/lib/utils";
import type { Timeframe } from "@/types";

const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];
const GRAD_ID = "statsGradient";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs font-medium"
      style={{ background: "#111f3a", border: "1px solid rgba(79,142,247,0.25)" }}>
      <p style={{ color: "#6b7fa8" }} className="mb-0.5">{label}</p>
      <p className="text-white font-semibold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function StatsChart() {
  const coins        = useWalletStore((s) => s.coins);
  const timeframe    = useWalletStore((s) => s.selectedTimeframe);
  const setTimeframe = useWalletStore((s) => s.setTimeframe);

  // Coin selector — default to bitcoin
  const [selectedCoinId, setSelectedCoinId] = useState("bitcoin");
  const [showCoinMenu, setShowCoinMenu]      = useState(false);

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) ?? coins[0];

  const { data, isLoading, isError, refetch } = useCoinChart(selectedCoinId, timeframe);

  const first    = data?.[0]?.value ?? 0;
  const last     = data?.[data.length - 1]?.value ?? 0;
  const pctChange = first > 0 ? ((last - first) / first) * 100 : 0;
  const isPositive = pctChange >= 0;
  const strokeColor = isPositive ? "#4f8ef7" : "#f75f7b";

  return (
    <motion.div variants={fadeUp} className="glass-card p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          {/* Coin picker */}
          <div className="relative">
            <button
              onClick={() => setShowCoinMenu((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-colors duration-200"
              style={{
                background: selectedCoin ? selectedCoin.bgColor : "rgba(255,255,255,0.05)",
                borderColor: selectedCoin ? selectedCoin.color + "40" : "rgba(255,255,255,0.1)",
                color: selectedCoin?.color ?? "#e8edf8",
              }}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ background: selectedCoin?.bgColor, color: selectedCoin?.color }}>
                {selectedCoin?.symbol?.slice(0, 2)}
              </span>
              {selectedCoin?.symbol}
              <ChevronDown size={12} className={cn("transition-transform", showCoinMenu && "rotate-180")} />
            </button>

            {showCoinMenu && (
              <div
                className="absolute left-0 top-10 w-44 rounded-xl border z-20 overflow-hidden"
                style={{ background: "#111f3a", borderColor: "rgba(255,255,255,0.1)" }}
                onMouseLeave={() => setShowCoinMenu(false)}
              >
                {coins.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCoinId(c.id); setShowCoinMenu(false); }}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2.5 text-xs font-medium text-left hover:bg-white/[0.05] transition-colors",
                      c.id === selectedCoinId ? "bg-white/[0.06]" : ""
                    )}
                    style={{ color: c.id === selectedCoinId ? c.color : "#e8edf8" }}
                  >
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                      style={{ background: c.bgColor, color: c.color }}>
                      {c.symbol.slice(0, 2)}
                    </span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Price + change */}
          <div>
            <p className="text-xl font-bold text-white leading-tight">
              {formatCurrency(last || selectedCoin?.price || 0)}
            </p>
            <div className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold mt-0.5",
              isPositive ? "text-accent-green" : "text-accent-red"
            )}>
              {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {formatPercent(pctChange)} this period
            </div>
          </div>
        </div>

        {/* Timeframe switcher */}
        <div className="flex gap-0.5 p-0.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {TIMEFRAMES.map((tf) => (
            <motion.button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                "relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200",
                timeframe === tf ? "text-white" : "text-[#6b7fa8] hover:text-white"
              )}
            >
              {timeframe === tf && (
                <motion.div layoutId="chart-tf" className="absolute inset-0 rounded-lg"
                  style={{ background: "#4f8ef7" }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.2 }} />
              )}
              <span className="relative z-10">{tf}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chart body */}
      {isError ? (
        <ErrorState variant="fetch" compact onRetry={() => refetch()} />
      ) : isLoading ? (
        <ChartSkeleton height={208} />
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={GRAD_ID} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={strokeColor} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="time"
                tick={{ fill: "#3d5070", fontSize: 11, fontFamily: "DM Sans" }}
                axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis
                tick={{ fill: "#3d5070", fontSize: 11, fontFamily: "DM Sans" }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(2)}`}
                domain={["auto", "auto"]}
                width={56}
              />
              <Tooltip content={<ChartTooltip />}
                cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
              <Area
                type="monotoneX" dataKey="value"
                stroke={strokeColor} strokeWidth={2}
                fill={`url(#${GRAD_ID})`} dot={false}
                activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
                isAnimationActive animationDuration={500} animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Source label */}
      {!isLoading && !isError && (
        <p className="text-[10px] mt-2 text-right" style={{ color: "#3d5070" }}>
          Source: CoinGecko · updates every 60s
        </p>
      )}
    </motion.div>
  );
}
