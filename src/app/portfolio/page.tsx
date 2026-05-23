"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, TrendingUp, TrendingDown,
  RefreshCw, BarChart2, Loader2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Sidebar }         from "@/components/layout/Sidebar";
import { TopNav }          from "@/components/layout/TopNav";
import { TickerBar }       from "@/components/layout/TickerBar";
import { GlobalMarketBar } from "@/components/dashboard/GlobalMarketBar";
import { AddHoldingModal } from "@/components/modals/AddHoldingModal";
import { SendModal }       from "@/components/modals/SendModal";
import { CoinDetailModal } from "@/components/modals/CoinDetailModal";
import { CoinRowSkeleton, TxRowSkeleton } from "@/components/ui/Skeleton";
import { ErrorState }      from "@/components/ui/ErrorState";
import { usePortfolio }    from "@/hooks/usePortfolio";
import { useBinanceWebSocket }        from "@/hooks/useBinanceWebSocket";
import { usePrefetchCoins, useCoins } from "@/hooks/useCoins";
import { useQueryClient }             from "@tanstack/react-query";
import { formatCurrency, formatPercent, formatDate, staggerContainer, fadeUp } from "@/lib/utils";
import toast from "react-hot-toast";
import type { EnrichedHolding } from "@/hooks/usePortfolio";

export default function PortfolioPage() {
  usePrefetchCoins();
  useCoins();
  useBinanceWebSocket();

  const qc = useQueryClient();
  const { holdings, transactions, totalValue, totalPnL, totalPnLPct, isLoading, isError, refetch } = usePortfolio();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editHolding,  setEditHolding]  = useState<EnrichedHolding | null>(null);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const [activeTab,    setActiveTab]    = useState<"holdings" | "transactions">("holdings");

  const isPositive = totalPnL >= 0;

  async function handleDelete(holding: EnrichedHolding) {
    if (!confirm(`Remove ${holding.symbol} from your portfolio?`)) return;
    setDeletingId(holding.id);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId: holding.coinId, symbol: holding.symbol, name: holding.name, quantity: 0 }),
      });
      if (!res.ok) throw new Error("Delete failed");
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success(`${holding.symbol} removed from portfolio`);
    } catch { toast.error("Failed to remove holding"); }
    finally { setDeletingId(null); }
  }

  const TX_ICON: Record<string, React.ElementType> = {
    send: ArrowUpRight, sent: ArrowUpRight, receive: ArrowDownLeft, received: ArrowDownLeft,
    swap: ArrowLeftRight, buy: ArrowUpRight,
  };
  const TX_COLOR: Record<string, string> = {
    send: "#f75f7b", sent: "#f75f7b", receive: "#22d3a5", received: "#22d3a5",
    swap: "#4f8ef7", buy: "#22d3a5",
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060d1f" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <GlobalMarketBar />
        <TickerBar />
        <TopNav title="Portfolio" subtitle="Manage your holdings and transactions" />

        <main className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div variants={staggerContainer} initial="hidden" animate="show"
            className="max-w-[1200px] mx-auto flex flex-col gap-4">

            {/* KPI strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Value", value: formatCurrency(totalValue),                                  color: "#4f8ef7" },
                { label: "Total P&L",   value: `${isPositive?"+":""}${formatCurrency(totalPnL)}`,           color: isPositive ? "#22d3a5" : "#f75f7b" },
                { label: "Return",      value: `${isPositive?"+":""}${totalPnLPct.toFixed(2)}%`,            color: isPositive ? "#22d3a5" : "#f75f7b" },
              ].map(({ label, value, color }) => (
                <motion.div key={label} variants={fadeUp} className="glass-card p-4">
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#6b7fa8" }}>{label}</p>
                  <p className="text-xl font-bold" style={{ color }}>{isLoading ? "—" : value}</p>
                </motion.div>
              ))}
            </div>

            {/* Tabs + actions */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
              <div className="flex gap-1 p-0.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {(["holdings","transactions"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="relative px-4 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize"
                    style={{ color: activeTab === tab ? "#fff" : "#6b7fa8" }}>
                    {activeTab === tab && (
                      <motion.div layoutId="portfolio-tab" className="absolute inset-0 rounded-lg"
                        style={{ background: "#4f8ef7" }} transition={{ duration: 0.2 }} />
                    )}
                    <span className="relative z-10">{tab}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileTap={{ scale: 0.88, rotate: 180 }} transition={{ duration: 0.4 }}
                  onClick={() => refetch()} className="btn-icon">
                  <RefreshCw size={14} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
                  onClick={() => { setEditHolding(null); setShowAddModal(true); }}
                  className="btn-primary text-xs px-4 py-2">
                  <Plus size={13} /> Add Holding
                </motion.button>
              </div>
            </motion.div>

            {isError && <ErrorState variant="fetch" compact onRetry={() => refetch()} />}

            {/* Holdings table */}
            <AnimatePresence mode="wait">
              {activeTab === "holdings" && (
                <motion.div key="holdings" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}
                  className="glass-card overflow-hidden">
                  <div className="grid items-center gap-4 px-5 py-3 border-b text-[10px] font-semibold uppercase tracking-widest"
                    style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px 80px", borderColor: "rgba(255,255,255,0.06)", color: "#3d5070" }}>
                    <span>Asset</span><span>Price</span><span>Holdings</span>
                    <span>Value</span><span>P&L</span><span>24h</span><span>Actions</span>
                  </div>

                  {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-4 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}><CoinRowSkeleton /></div>
                  )) : holdings.filter(h => h.quantity > 0).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <BarChart2 size={36} className="mb-3" style={{ color: "#3d5070" }} />
                      <p className="text-sm font-medium text-white mb-1">No holdings yet</p>
                      <p className="text-xs mb-4" style={{ color: "#6b7fa8" }}>Add your first asset to start tracking</p>
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowAddModal(true)}
                        className="btn-primary text-xs px-4 py-2"><Plus size={13} /> Add Holding</motion.button>
                    </div>
                  ) : holdings.filter(h => h.quantity > 0).map((h, i) => {
                    const sparkData = h.sparkline.map((v, idx) => ({ i: idx, v }));
                    const pos24h    = h.priceChangePct24h >= 0;
                    const posPnL    = h.pnl >= 0;
                    return (
                      <motion.div key={h.id} layout whileHover={{ backgroundColor: "rgba(79,142,247,0.03)" }}
                        className="grid items-center gap-4 px-5 py-3.5 border-b transition-colors"
                        style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px 80px", borderColor: "rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ background: h.bgColor, color: h.color }}>{h.symbol.slice(0,2)}</div>
                          <div>
                            <p className="text-sm font-semibold text-white">{h.symbol}</p>
                            <p className="text-xs truncate" style={{ color: "#6b7fa8" }}>{h.name}</p>
                          </div>
                        </div>
                        <motion.p key={h.currentPrice.toFixed(2)}
                          initial={{ color: pos24h ? "#22d3a5" : "#f75f7b" }} animate={{ color: "#e8edf8" }}
                          transition={{ duration: 1.5 }} className="text-sm font-semibold">
                          {formatCurrency(h.currentPrice)}
                        </motion.p>
                        <div>
                          <p className="text-sm text-white">{h.quantity.toFixed(4)}</p>
                          {h.avgBuyPrice > 0 && <p className="text-[10px]" style={{ color: "#6b7fa8" }}>avg {formatCurrency(h.avgBuyPrice)}</p>}
                        </div>
                        <p className="text-sm font-semibold text-white">{formatCurrency(h.currentValue)}</p>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: posPnL ? "#22d3a5" : "#f75f7b" }}>
                            {posPnL?"+":""}{formatCurrency(h.pnl)}
                          </p>
                          <p className="text-[10px]" style={{ color: posPnL ? "#22d3a5" : "#f75f7b" }}>{formatPercent(h.pnlPct)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="h-6 w-16">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sparkData}>
                                <Line type="monotone" dataKey="v" stroke={pos24h?"#22d3a5":"#f75f7b"} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                          <p className="text-[10px] font-semibold" style={{ color: pos24h?"#22d3a5":"#f75f7b" }}>
                            {formatPercent(h.priceChangePct24h)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <motion.button whileTap={{ scale: 0.88 }}
                            onClick={() => { setEditHolding(h); setShowAddModal(true); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                            style={{ color: "#6b7fa8" }}><Pencil size={12} /></motion.button>
                          <motion.button whileTap={{ scale: 0.88 }} onClick={() => handleDelete(h)}
                            disabled={deletingId === h.id}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors disabled:opacity-40"
                            style={{ color: "#f75f7b" }}>
                            {deletingId === h.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}

              {activeTab === "transactions" && (
                <motion.div key="transactions" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}
                  className="glass-card overflow-hidden">
                  <div className="grid items-center gap-4 px-5 py-3 border-b text-[10px] font-semibold uppercase tracking-widest"
                    style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", borderColor: "rgba(255,255,255,0.06)", color: "#3d5070" }}>
                    <span>Transaction</span><span>Asset</span><span>Amount</span><span>Price</span><span>Date</span>
                  </div>
                  {isLoading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="px-4"><TxRowSkeleton /></div>)
                    : transactions.length === 0
                    ? <div className="flex flex-col items-center justify-center py-14"><p className="text-sm" style={{ color: "#6b7fa8" }}>No transactions yet</p></div>
                    : transactions.map(tx => {
                        const isIncome = ["receive","received","buy"].includes(tx.type);
                        const Icon  = TX_ICON[tx.type] ?? ArrowLeftRight;
                        const color = TX_COLOR[tx.type] ?? "#6b7fa8";
                        return (
                          <div key={tx.id} className="grid items-center gap-4 px-5 py-3 border-b"
                            style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", borderColor: "rgba(255,255,255,0.04)" }}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                                <Icon size={13} style={{ color }} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white capitalize">{tx.type}</p>
                                <p className="text-[10px] font-mono" style={{ color: "#3d5070" }}>
                                  {tx.txHash ?? (tx.cardLast4 ? `•••• ${tx.cardLast4}` : "—")}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm text-white">{tx.symbol}</span>
                            <p className="text-sm font-semibold" style={{ color: isIncome?"#22d3a5":"#f75f7b" }}>
                              {isIncome?"+":"-"}{tx.quantity.toFixed(4)}
                            </p>
                            <p className="text-sm text-white">{formatCurrency(tx.price)}</p>
                            <p className="text-xs" style={{ color: "#6b7fa8" }}>{formatDate(tx.date)}</p>
                          </div>
                        );
                      })
                  }
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>

      <AddHoldingModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setEditHolding(null); }}
        editing={editHolding}
      />
      <SendModal />
      <CoinDetailModal />
    </div>
  );
}
