"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import {
  TrendingUp, TrendingDown, Award, Zap, Shield,
  ChevronDown, Loader2,
} from "lucide-react";
import { Sidebar }         from "@/components/layout/Sidebar";
import { TopNav }          from "@/components/layout/TopNav";
import { TickerBar }       from "@/components/layout/TickerBar";
import { GlobalMarketBar } from "@/components/dashboard/GlobalMarketBar";
import { SendModal }       from "@/components/modals/SendModal";
import { ReceiveModal }    from "@/components/modals/ReceiveModal";
import { CoinDetailModal } from "@/components/modals/CoinDetailModal";
import { ChartSkeleton, MetricCardSkeleton } from "@/components/ui/Skeleton";
import { ErrorState }      from "@/components/ui/ErrorState";
import { useCoins, useCoinChart, usePrefetchCoins } from "@/hooks/useCoins";
import { useBinanceWebSocket }  from "@/hooks/useBinanceWebSocket";
import { useWalletStore }       from "@/store/walletStore";
import { formatCurrency, formatPercent, formatCompactNumber, staggerContainer, fadeUp, cn } from "@/lib/utils";
import type { Timeframe } from "@/types";

const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

const PNL_MONTHS = [
  { m: "Jan", pnl: 142 }, { m: "Feb", pnl: -88  }, { m: "Mar", pnl: 256 },
  { m: "Apr", pnl: -102 }, { m: "May", pnl: 318 }, { m: "Jun", pnl: 204 },
  { m: "Jul", pnl: -56  }, { m: "Aug", pnl: 301 }, { m: "Sep", pnl: 204 },
  { m: "Oct", pnl: 201  }, { m: "Nov", pnl: 198 }, { m: "Dec", pnl: 122 },
];

const RADAR_DATA = [
  { axis: "Diversification", value: 72 },
  { axis: "Volatility",      value: 58 },
  { axis: "Liquidity",       value: 85 },
  { axis: "Return",          value: 68 },
  { axis: "Sharpe",          value: 61 },
  { axis: "Stability",       value: 54 },
];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-card"
      style={{ background: "#111f3a", border: "1px solid rgba(79,142,247,0.25)" }}>
      <p style={{ color: "#6b7fa8" }}>{label}</p>
      <p className="font-semibold text-white">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  usePrefetchCoins();
  useBinanceWebSocket();

  const coins     = useWalletStore((s) => s.coins);
  const portfolio = useWalletStore((s) => s.portfolio);
  const { isLoading: coinsLoading } = useCoins();

  const [tf, setTf]                     = useState<Timeframe>("1Y");
  const [selectedCoinId, setSelectedId] = useState("bitcoin");
  const [showCoinMenu, setShowCoinMenu] = useState(false);

  const selectedCoin = coins.find((c) => c.id === selectedCoinId) ?? coins[0];
  const { data: chartData, isLoading: chartLoading, isError: chartError, refetch } =
    useCoinChart(selectedCoinId, tf);

  const pctChange  = useMemo(() => {
    if (!chartData?.length) return 0;
    const f = chartData[0].value, l = chartData[chartData.length - 1].value;
    return f > 0 ? ((l - f) / f) * 100 : 0;
  }, [chartData]);
  const isPositive  = pctChange >= 0;
  const strokeColor = isPositive ? "#4f8ef7" : "#f75f7b";

  const sorted     = [...coins].sort((a, b) => b.priceChangePct24h - a.priceChangePct24h);
  const winMonths  = PNL_MONTHS.filter((m) => m.pnl > 0).length;
  const bestMonth  = PNL_MONTHS.reduce((a, b) => b.pnl > a.pnl ? b : a);
  const worstMonth = PNL_MONTHS.reduce((a, b) => b.pnl < a.pnl ? b : a);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060d1f" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <GlobalMarketBar />
        <TickerBar />
        <TopNav title="Analytics" subtitle="Portfolio performance & risk metrics" />

        <main className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div variants={staggerContainer} initial="hidden" animate="show"
            className="max-w-[1400px] mx-auto flex flex-col gap-4">

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {coinsLoading
                ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
                : [
                    { icon: TrendingUp, label: "Total Return",  value: formatCurrency(portfolio.totalPnL),       sub: formatPercent(portfolio.totalPnLPct),  color: "#22d3a5", glow: "rgba(34,211,165,0.12)" },
                    { icon: Award,      label: "Sharpe Ratio",  value: "1.42",                                    sub: "Risk-adjusted",                        color: "#4f8ef7", glow: "rgba(79,142,247,0.12)" },
                    { icon: Shield,     label: "Max Drawdown",  value: "-18.4%",                                  sub: "From peak",                            color: "#f75f7b", glow: "rgba(247,95,123,0.12)" },
                    { icon: Zap,        label: "Volatility",    value: "24.6%",                                   sub: "Annualised",                           color: "#f7c948", glow: "rgba(247,201,72,0.12)" },
                  ].map(({ icon: Icon, label, value, sub, color, glow }) => (
                    <motion.div key={label} variants={fadeUp} className="glass-card p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: glow }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide" style={{ color: "#6b7fa8" }}>{label}</p>
                        <p className="text-lg font-bold text-white leading-tight">{value}</p>
                        <p className="text-xs font-medium" style={{ color }}>{sub}</p>
                      </div>
                    </motion.div>
                  ))
              }
            </div>

            {/* Row: real chart + radar */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 280px" }}>

              {/* Real price chart */}
              <motion.div variants={fadeUp} className="glass-card p-5">
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {/* Coin picker */}
                    <div className="relative">
                      <button
                        onClick={() => setShowCoinMenu((v) => !v)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium"
                        style={{ background: selectedCoin?.bgColor, borderColor: (selectedCoin?.color ?? "#fff") + "40", color: selectedCoin?.color }}
                      >
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                          style={{ background: selectedCoin?.bgColor, color: selectedCoin?.color }}>
                          {selectedCoin?.symbol?.slice(0, 2)}
                        </span>
                        {selectedCoin?.symbol}
                        <ChevronDown size={12} className={cn("transition-transform", showCoinMenu && "rotate-180")} />
                      </button>
                      {showCoinMenu && (
                        <div className="absolute left-0 top-10 w-44 rounded-xl border z-20 overflow-hidden"
                          style={{ background: "#111f3a", borderColor: "rgba(255,255,255,0.1)" }}
                          onMouseLeave={() => setShowCoinMenu(false)}>
                          {coins.map((c) => (
                            <button key={c.id} onClick={() => { setSelectedId(c.id); setShowCoinMenu(false); }}
                              className={cn("flex items-center gap-2 w-full px-3 py-2.5 text-xs font-medium hover:bg-white/[0.05] transition-colors",
                                c.id === selectedCoinId ? "bg-white/[0.06]" : "")}
                              style={{ color: c.id === selectedCoinId ? c.color : "#e8edf8" }}>
                              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                                style={{ background: c.bgColor, color: c.color }}>
                                {c.symbol.slice(0, 2)}
                              </span>
                              {c.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(chartData?.[chartData.length - 1]?.value ?? selectedCoin?.price ?? 0)}
                      </p>
                      <span className={cn("text-xs font-semibold flex items-center gap-0.5", isPositive ? "text-accent-green" : "text-accent-red")}>
                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {formatPercent(pctChange)} this period
                      </span>
                    </div>
                  </div>

                  {/* TF switcher */}
                  <div className="flex gap-0.5 p-0.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {TIMEFRAMES.map((t) => (
                      <motion.button key={t} onClick={() => setTf(t)}
                        className="relative px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                        style={{ color: tf === t ? "#fff" : "#6b7fa8" }}>
                        {tf === t && (
                          <motion.div layoutId="an-tf" className="absolute inset-0 rounded-lg"
                            style={{ background: "#4f8ef7" }} transition={{ duration: 0.3, type: "spring" }} />
                        )}
                        <span className="relative z-10">{t}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {chartError ? (
                  <ErrorState variant="fetch" compact onRetry={() => refetch()} />
                ) : chartLoading ? (
                  <ChartSkeleton height={208} />
                ) : (
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor={strokeColor} stopOpacity={0.22} />
                            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="time" tick={{ fill: "#3d5070", fontSize: 10, fontFamily: "Poppins" }}
                          axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: "#3d5070", fontSize: 10, fontFamily: "Poppins" }}
                          axisLine={false} tickLine={false} width={56}
                          tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v.toFixed(2)}`}
                          domain={["auto", "auto"]} />
                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
                        <Area type="monotoneX" dataKey="value" stroke={strokeColor} strokeWidth={2}
                          fill="url(#anGrad)" dot={false}
                          activeDot={{ r: 4, fill: strokeColor, strokeWidth: 0 }}
                          isAnimationActive animationDuration={500} animationEasing="ease-out" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="text-[10px] mt-2 text-right" style={{ color: "#3d5070" }}>
                  Source: CoinGecko · real-time via Binance WS
                </p>
              </motion.div>

              {/* Radar */}
              <motion.div variants={fadeUp} className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-1">Risk Profile</h3>
                <p className="text-xs mb-3" style={{ color: "#6b7fa8" }}>Moderate-High · Score 6.4/10</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={RADAR_DATA} cx="50%" cy="50%" outerRadius="70%">
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis dataKey="axis" tick={{ fill: "#6b7fa8", fontSize: 9, fontFamily: "Poppins" }} />
                      <Radar name="Portfolio" dataKey="value" stroke="#4f8ef7" strokeWidth={1.5} fill="rgba(79,142,247,0.15)" />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {RADAR_DATA.map(({ axis, value }) => (
                    <div key={axis} className="text-center">
                      <p className="text-[10px]" style={{ color: "#6b7fa8" }}>{axis.slice(0, 5)}</p>
                      <p className="text-xs font-bold" style={{ color: value >= 70 ? "#22d3a5" : value >= 55 ? "#f7c948" : "#f75f7b" }}>{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Row: Monthly P&L + Top movers */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <motion.div variants={fadeUp} className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Monthly P&L</h3>
                  <div className="flex gap-3 text-xs" style={{ color: "#6b7fa8" }}>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#22d3a5" }} />{winMonths} winning</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#f75f7b" }} />{12 - winMonths} losing</span>
                  </div>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PNL_MONTHS} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="m" tick={{ fill: "#3d5070", fontSize: 10, fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#3d5070", fontSize: 10, fontFamily: "Poppins" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                      <Tooltip content={({ active, payload, label }) =>
                        active && payload?.length ? (
                          <div className="rounded-xl px-3 py-2 text-xs" style={{ background: "#111f3a", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <p style={{ color: "#6b7fa8" }}>{label}</p>
                            <p className="font-bold" style={{ color: (payload[0].value as number) >= 0 ? "#22d3a5" : "#f75f7b" }}>
                              {(payload[0].value as number) >= 0 ? "+" : ""}{formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        ) : null
                      } />
                      <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                        {PNL_MONTHS.map((entry, i) => (
                          <Cell key={i} fill={entry.pnl >= 0 ? "#22d3a5" : "#f75f7b"} opacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex gap-4 mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Best Month</p>
                    <p className="text-sm font-bold text-accent-green">+{formatCurrency(bestMonth.pnl)} ({bestMonth.m})</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Worst Month</p>
                    <p className="text-sm font-bold text-accent-red">{formatCurrency(worstMonth.pnl)} ({worstMonth.m})</p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Asset Performance (24h)</h3>
                <div className="flex flex-col gap-3">
                  {sorted.map((c, i) => {
                    const isPos = c.priceChangePct24h >= 0;
                    const barW  = Math.abs(c.priceChangePct24h) / Math.max(...coins.map((x) => Math.abs(x.priceChangePct24h))) * 100;
                    return (
                      <motion.div key={c.id} variants={fadeUp} className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold"
                              style={{ background: c.bgColor, color: c.color }}>{c.symbol.slice(0, 2)}</div>
                            <span className="font-medium text-white">{c.symbol}</span>
                          </div>
                          <motion.span key={c.priceChangePct24h.toFixed(3)}
                            initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}
                            className={`font-bold ${isPos ? "text-accent-green" : "text-accent-red"}`}>
                            {formatPercent(c.priceChangePct24h)}
                          </motion.span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${barW}%` }}
                            transition={{ duration: 0.8, delay: i * 0.08, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ background: isPos ? "#22d3a5" : "#f75f7b" }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t flex justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Portfolio 24h</p>
                    <p className="text-sm font-bold" style={{ color: portfolio.change24h >= 0 ? "#22d3a5" : "#f75f7b" }}>
                      {portfolio.change24h >= 0 ? "+" : ""}{formatCurrency(portfolio.change24h)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Total Value</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(portfolio.totalValue)}</p>
                  </div>
                </div>
              </motion.div>
            </div>

          </motion.div>
        </main>
      </div>
      <SendModal />
      <ReceiveModal />
      <CoinDetailModal />
    </div>
  );
}
