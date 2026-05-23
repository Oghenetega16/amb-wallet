"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, TrendingUp, TrendingDown, RefreshCw, Loader2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Sidebar }         from "@/components/layout/Sidebar";
import { TopNav }          from "@/components/layout/TopNav";
import { TickerBar }       from "@/components/layout/TickerBar";
import { GlobalMarketBar } from "@/components/dashboard/GlobalMarketBar";
import { SendModal }       from "@/components/modals/SendModal";
import { ReceiveModal }    from "@/components/modals/ReceiveModal";
import { CoinDetailModal } from "@/components/modals/CoinDetailModal";
import { CoinRowSkeleton } from "@/components/ui/Skeleton";
import { ErrorState }      from "@/components/ui/ErrorState";
import { useCoins, usePrefetchCoins } from "@/hooks/useCoins";
import { useBinanceWebSocket }        from "@/hooks/useBinanceWebSocket";
import { useWalletStore }   from "@/store/walletStore";
import { formatCurrency, formatPercent, formatCompactNumber, staggerContainer, fadeUp } from "@/lib/utils";

type SortKey = "value" | "price" | "change" | "marketCap";

export default function CurrenciesPage() {
  usePrefetchCoins();
  useBinanceWebSocket();

  const coins     = useWalletStore((s) => s.coins);
  const openModal = useWalletStore((s) => s.openModal);
  const { isLoading, isError, refetch, dataUpdatedAt } = useCoins();

  const [query,  setQuery]  = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("value");

  const filtered = coins
    .filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.symbol.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) =>
      sortBy === "price"     ? b.price - a.price :
      sortBy === "change"    ? b.priceChangePct24h - a.priceChangePct24h :
      sortBy === "marketCap" ? (b.marketCap ?? 0) - (a.marketCap ?? 0) :
      b.value - a.value
    );

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060d1f" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <GlobalMarketBar />
        <TickerBar />
        <TopNav title="Currencies" subtitle="Live market overview" />

        <main className="flex-1 overflow-y-auto px-5 py-4">
          <div className="max-w-[1400px] mx-auto">

            {/* Filters row */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="relative flex-1 max-w-xs">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#3d5070" }} />
                <input value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search coins..." className="field-input pl-9 py-2 text-sm" />
              </div>

              <div className="flex gap-1.5">
                {(["value","price","change","marketCap"] as SortKey[]).map((s) => {
                  const labels: Record<SortKey, string> = {
                    value: "Holdings", price: "Price", change: "24h Change", marketCap: "Market Cap"
                  };
                  return (
                    <button key={s} onClick={() => setSortBy(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{
                        background: sortBy === s ? "rgba(79,142,247,0.15)" : "rgba(255,255,255,0.04)",
                        color:      sortBy === s ? "#4f8ef7" : "#6b7fa8",
                        border: `1px solid ${sortBy === s ? "rgba(79,142,247,0.3)" : "rgba(255,255,255,0.07)"}`,
                      }}>
                      {labels[s]}
                    </button>
                  );
                })}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {lastUpdated && (
                  <p className="text-[10px]" style={{ color: "#3d5070" }}>Updated {lastUpdated}</p>
                )}
                <motion.button whileTap={{ scale: 0.88, rotate: 180 }} transition={{ duration: 0.4 }}
                  onClick={() => refetch()} className="btn-icon" disabled={isLoading}>
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                </motion.button>
              </div>
            </div>

            {/* Error */}
            {isError && (
              <div className="mb-4">
                <ErrorState variant="fetch" compact onRetry={() => refetch()} />
              </div>
            )}

            {/* Table header */}
            <div className="grid items-center gap-4 px-4 mb-2"
              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 1fr 100px" }}>
              {["Asset","Price","24h Change","Holdings","Chart","Market Cap","Action"].map((h) => (
                <p key={h} className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#3d5070" }}>{h}</p>
              ))}
            </div>

            {/* Rows */}
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-2">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="glass-card px-4 py-1">
                      <CoinRowSkeleton />
                    </div>
                  ))
                : filtered.map((coin) => {
                    const isPos     = coin.priceChangePct24h >= 0;
                    const sparkData = coin.sparkline.map((v, i) => ({ i, v }));
                    return (
                      <motion.div
                        key={coin.id} variants={fadeUp}
                        whileHover={{ scale: 1.003, x: 2 }}
                        className="glass-card grid items-center gap-4 px-4 py-3 cursor-pointer"
                        style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 80px 1fr 100px" }}
                        onClick={() => openModal("coinDetail", coin)}
                      >
                        {/* Asset */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: coin.bgColor, color: coin.color }}>
                            {coin.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{coin.symbol}</p>
                            <p className="text-xs" style={{ color: "#6b7fa8" }}>{coin.name}</p>
                          </div>
                        </div>

                        {/* Price — flashes on WS update */}
                        <motion.p
                          key={coin.price.toFixed(2)}
                          initial={{ color: isPos ? "#22d3a5" : "#f75f7b" }}
                          animate={{ color: "#e8edf8" }}
                          transition={{ duration: 1.5 }}
                          className="text-sm font-semibold"
                        >
                          {formatCurrency(coin.price)}
                        </motion.p>

                        {/* 24h change */}
                        <div className={`flex items-center gap-1 text-xs font-semibold ${isPos ? "text-accent-green" : "text-accent-red"}`}>
                          {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {formatPercent(coin.priceChangePct24h)}
                        </div>

                        {/* Holdings */}
                        <div>
                          <p className="text-sm font-semibold text-white">{formatCurrency(coin.value)}</p>
                          <p className="text-[10px]" style={{ color: "#6b7fa8" }}>
                            {coin.quantity.toFixed(4)} {coin.symbol}
                          </p>
                        </div>

                        {/* Sparkline */}
                        <div className="h-10">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sparkData}>
                              <Line type="monotone" dataKey="v"
                                stroke={isPos ? "#22d3a5" : "#f75f7b"}
                                strokeWidth={1.5} dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Market cap */}
                        <p className="text-sm text-white">
                          {coin.marketCap ? formatCompactNumber(coin.marketCap) : "—"}
                        </p>

                        {/* Action */}
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal("send", coin); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                          style={{ background: "rgba(79,142,247,0.1)", color: "#4f8ef7", border: "1px solid rgba(79,142,247,0.2)" }}
                        >
                          Trade
                        </button>
                      </motion.div>
                    );
                  })}
            </motion.div>

          </div>
        </main>
      </div>
      <SendModal />
      <ReceiveModal />
      <CoinDetailModal />
    </div>
  );
}
