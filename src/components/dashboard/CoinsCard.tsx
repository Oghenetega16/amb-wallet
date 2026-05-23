"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, RefreshCw, Plus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { useWalletStore, selectTopCoins } from "@/store/walletStore";
import { useCoins } from "@/hooks/useCoins";
import { CoinRowSkeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { formatCurrency, formatPercent, staggerContainer, fadeUp } from "@/lib/utils";
import type { Coin } from "@/types";

export function CoinsCard() {
  const coins           = useWalletStore(selectTopCoins);
  const openModal       = useWalletStore((s) => s.openModal);
  const { isLoading, isError, refetch, dataUpdatedAt } = useCoins();

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <motion.div variants={fadeUp} className="glass-card p-5 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-sm font-semibold text-white">Coins</span>
          {lastUpdated && (
            <p className="text-[10px] mt-0.5" style={{ color: "#3d5070" }}>
              Updated {lastUpdated}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => openModal("send")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.25)", color: "#4f8ef7" }}
          >
            <Plus size={11} /> Buy coins
          </motion.button>
          <motion.button whileTap={{ scale: 0.88, rotate: 180 }}
            transition={{ duration: 0.4 }}
            onClick={() => refetch()}
            className="btn-icon">
            <RefreshCw size={14} />
          </motion.button>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="mb-3">
          <ErrorState variant="fetch" compact onRetry={() => refetch()} />
        </div>
      )}

      {/* Coin rows or skeletons */}
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CoinRowSkeleton key={i} />)
          : coins.map((coin, i) => <CoinRow key={coin.id} coin={coin} index={i} />)
        }
      </motion.div>
    </motion.div>
  );
}

function CoinRow({ coin, index }: { coin: Coin; index: number }) {
  const openModal  = useWalletStore((s) => s.openModal);
  const isPositive = coin.priceChangePct24h >= 0;
  const sparkData  = coin.sparkline.map((v, i) => ({ i, v }));

  return (
    <motion.div
      variants={fadeUp}
      layout
      whileHover={{ backgroundColor: "rgba(79,142,247,0.04)", x: 2 }}
      onClick={() => openModal("coinDetail", coin)}
      className="flex items-center gap-3 py-2.5 cursor-pointer rounded-xl px-2 -mx-2 transition-colors"
      style={{ borderBottom: index < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
    >
      {/* Icon */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ background: coin.bgColor, color: coin.color }}>
        {coin.symbol.slice(0, 2)}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{coin.symbol}</p>
        <p className="text-xs truncate" style={{ color: "#6b7fa8" }}>{coin.name}</p>
      </div>

      {/* Sparkline */}
      <div className="w-16 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line type="monotone" dataKey="v"
              stroke={isPositive ? "#22d3a5" : "#f75f7b"}
              strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Change */}
      <div className="text-right w-20">
        <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${isPositive ? "text-accent-green" : "text-accent-red"}`}>
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {formatPercent(coin.priceChangePct24h)}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: "#6b7fa8" }}>
          {isPositive ? "+" : ""}{formatCurrency(coin.priceChange24h)}
        </p>
      </div>

      {/* Price */}
      <div className="text-right w-20">
        <motion.p
          key={coin.price.toFixed(2)}
          initial={{ color: isPositive ? "#22d3a5" : "#f75f7b" }}
          animate={{ color: "#e8edf8" }}
          transition={{ duration: 1.5 }}
          className="text-sm font-semibold"
        >
          {coin.price >= 1000 ? `$${(coin.price / 1000).toFixed(2)}K` : formatCurrency(coin.price)}
        </motion.p>
        <p className="text-[10px]" style={{ color: "#6b7fa8" }}>{coin.quantity.toFixed(3)}</p>
      </div>
    </motion.div>
  );
}
