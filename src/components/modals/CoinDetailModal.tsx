"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, TrendingDown, BarChart2, Globe } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useWalletStore } from "@/store/walletStore";
import { formatCurrency, formatPercent, formatCompactNumber, modalOverlay, modalContent } from "@/lib/utils";

export function CoinDetailModal() {
  const activeModal  = useWalletStore((s) => s.activeModal);
  const selectedCoin = useWalletStore((s) => s.selectedCoin);
  const closeModal   = useWalletStore((s) => s.closeModal);
  const openModal    = useWalletStore((s) => s.openModal);

  const isOpen = activeModal === "coinDetail" && !!selectedCoin;
  if (!selectedCoin) return null;

  const isPos = selectedCoin.priceChangePct24h >= 0;
  const sparkData = selectedCoin.sparkline.map((v, i) => ({ i, v }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={modalOverlay}
          initial="hidden" animate="show" exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(6,13,31,0.85)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <motion.div
            variants={modalContent}
            initial="hidden" animate="show" exit="exit"
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{ background: "#0d1730", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Colored top band */}
            <div className="h-1 w-full" style={{ background: selectedCoin.color }} />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: selectedCoin.bgColor, color: selectedCoin.color }}>
                    {selectedCoin.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{selectedCoin.name}</h2>
                    <p className="text-xs" style={{ color: "#6b7fa8" }}>{selectedCoin.symbol}</p>
                  </div>
                </div>
                <motion.button whileTap={{ scale: 0.88 }} onClick={closeModal}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-[#6b7fa8] hover:text-white transition-colors">
                  <X size={15} />
                </motion.button>
              </div>

              {/* Price */}
              <div className="mb-4">
                <p className="text-3xl font-bold text-white">{formatCurrency(selectedCoin.price)}</p>
                <div className={`inline-flex items-center gap-1 text-sm font-semibold mt-1 ${isPos ? "text-accent-green" : "text-accent-red"}`}>
                  {isPos ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {formatPercent(selectedCoin.priceChangePct24h)} today
                </div>
              </div>

              {/* Sparkline */}
              <div className="h-24 mb-5 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <defs>
                      <linearGradient id="coinGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={selectedCoin.color} stopOpacity={0.2} />
                        <stop offset="100%" stopColor={selectedCoin.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="i" hide />
                    <Tooltip
                      content={({ active, payload }) =>
                        active && payload?.length ? (
                          <div className="rounded-lg px-2 py-1 text-xs" style={{ background: "#111f3a", border: "1px solid rgba(255,255,255,0.1)" }}>
                            <p className="text-white font-semibold">{formatCurrency(payload[0].value as number)}</p>
                          </div>
                        ) : null
                      }
                    />
                    <Area type="monotone" dataKey="v" stroke={selectedCoin.color} strokeWidth={2}
                      fill="url(#coinGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Your Holdings", value: formatCurrency(selectedCoin.value) },
                  { label: "Quantity",      value: `${selectedCoin.quantity.toFixed(4)} ${selectedCoin.symbol}` },
                  { label: "Market Cap",    value: selectedCoin.marketCap ? formatCompactNumber(selectedCoin.marketCap) : "—" },
                  { label: "24h Volume",    value: selectedCoin.volume24h ? formatCompactNumber(selectedCoin.volume24h) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "#6b7fa8" }}>{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => openModal("send", selectedCoin)}
                  className="btn-primary flex-1 py-2.5 text-sm">
                  Buy / Send
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }}
                  onClick={() => openModal("receive", selectedCoin)}
                  className="btn-secondary flex-1 py-2.5 text-sm">
                  Receive
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
