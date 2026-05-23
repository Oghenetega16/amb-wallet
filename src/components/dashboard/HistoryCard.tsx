"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ShoppingCart, RefreshCw } from "lucide-react";
import { useWalletStore, selectTransactions } from "@/store/walletStore";
import { formatCurrency, formatDate, staggerContainer, fadeUp } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TxType, Transaction } from "@/types";

const FILTERS = [
  { id: "all",      label: "All" },
  { id: "sent",     label: "Sent" },
  { id: "received", label: "Received" },
] as const;

const TX_ICON: Record<TxType, React.ElementType> = {
  sent:     ArrowUpRight,
  received: ArrowDownLeft,
  swap:     ArrowLeftRight,
  buy:      ShoppingCart,
};

const TX_COLOR: Record<TxType, string> = {
  sent:     "#f75f7b",
  received: "#22d3a5",
  swap:     "#4f8ef7",
  buy:      "#f7c948",
};

const TX_BG: Record<TxType, string> = {
  sent:     "rgba(247,95,123,0.1)",
  received: "rgba(34,211,165,0.1)",
  swap:     "rgba(79,142,247,0.1)",
  buy:      "rgba(247,201,72,0.1)",
};

export function HistoryCard() {
  const transactions = useWalletStore(selectTransactions);
  const txFilter     = useWalletStore((s) => s.txFilter);
  const setTxFilter  = useWalletStore((s) => s.setTxFilter);

  return (
    <motion.div variants={fadeUp} className="glass-card p-5 flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-white">History</span>
        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {FILTERS.map(({ id, label }) => (
              <motion.button
                key={id}
                onClick={() => setTxFilter(id)}
                className={cn(
                  "relative px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200",
                  txFilter === id ? "text-white" : "text-[#6b7fa8] hover:text-white"
                )}
              >
                {txFilter === id && (
                  <motion.div
                    layoutId="tx-filter"
                    className="absolute inset-0 rounded-md"
                    style={{ background: "#4f8ef7" }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </motion.button>
            ))}
          </div>
          <motion.button whileTap={{ scale: 0.88, rotate: 180 }} transition={{ duration: 0.4 }} className="btn-icon">
            <RefreshCw size={14} />
          </motion.button>
        </div>
      </div>

      {/* Transaction list */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="flex flex-col"
      >
        <AnimatePresence mode="popLayout">
          {transactions.slice(0, 6).map((tx, i) => (
            <TxRow key={tx.id} tx={tx} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function TxRow({ tx, index }: { tx: Transaction; index: number }) {
  const Icon     = TX_ICON[tx.type];
  const color    = TX_COLOR[tx.type];
  const bg       = TX_BG[tx.type];
  const isIncome = tx.type === "received" || tx.type === "buy";

  return (
    <motion.div
      variants={fadeUp}
      layout
      whileHover={{ backgroundColor: "rgba(79,142,247,0.04)", x: 2 }}
      className="flex items-center gap-3 py-2.5 cursor-pointer rounded-xl px-2 -mx-2 transition-colors"
      style={{ borderBottom: index < 5 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
    >
      {/* Card-style icon */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: bg }}
      >
        <Icon size={14} style={{ color }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white capitalize">{tx.type}</p>
        <p className="text-[10px] truncate font-mono" style={{ color: "#6b7fa8" }}>
          {tx.cardLast4 ? `•••• •••• •••• ${tx.cardLast4}` : tx.hash ?? "—"}
        </p>
      </div>

      {/* Amount + date */}
      <div className="text-right">
        <p className="text-sm font-semibold" style={{ color: isIncome ? "#22d3a5" : "#f75f7b" }}>
          {isIncome ? "+" : "-"}{formatCurrency(tx.usdValue)}
        </p>
        <p className="text-[10px]" style={{ color: "#6b7fa8" }}>
          {formatDate(tx.date)}
        </p>
      </div>

      {/* Status dot */}
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background:
            tx.status === "completed" ? "#22d3a5" :
            tx.status === "pending"   ? "#f7c948" : "#f75f7b",
        }}
      />
    </motion.div>
  );
}
