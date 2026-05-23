"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatCurrency } from "@/lib/utils";

export function TickerBar() {
  const coins = useWalletStore((s) => s.coins);

  // Duplicate for seamless scroll
  const items = [...coins, ...coins];

  return (
    <div
      className="relative overflow-hidden h-9 flex items-center shrink-0"
      style={{ background: "#0a1020", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #0a1020, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #0a1020, transparent)" }} />

      <motion.div
        animate={{ x: "-50%" }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        className="flex items-center gap-6 whitespace-nowrap px-4"
      >
        {items.map((coin, i) => {
          const isPos = coin.priceChangePct24h >= 0;
          return (
            <span key={`${coin.id}-${i}`} className="inline-flex items-center gap-2 text-xs">
              <span className="font-semibold text-white">{coin.symbol}</span>
              <span style={{ color: "#6b7fa8" }}>{formatCurrency(coin.price)}</span>
              <span className={`flex items-center gap-0.5 ${isPos ? "text-accent-green" : "text-accent-red"}`}>
                {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {isPos ? "+" : ""}{coin.priceChangePct24h.toFixed(2)}%
              </span>
            </span>
          );
        })}
      </motion.div>
    </div>
  );
}
