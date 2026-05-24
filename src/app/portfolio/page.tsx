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
  usePrefetchCoins(); useCoins(); useBinanceWebSocket();
  const qc = useQueryClient();
  const { holdings, transactions, totalValue, totalPnL, totalPnLPct, isLoading, isError, refetch } = usePortfolio();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editHolding,  setEditHolding]  = useState<EnrichedHolding | null>(null);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const [activeTab,    setActiveTab]    = useState<"holdings" | "transactions">("holdings");
  const isPositive = totalPnL >= 0;

  async function handleDelete(h: EnrichedHolding) {
    if (!confirm(`Remove ${h.symbol} from your portfolio?`)) return;
    setDeletingId(h.id);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinId: h.coinId, symbol: h.symbol, name: h.name, quantity: 0 }),
      });
      if (!res.ok) throw new Error();
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success(`${h.symbol} removed`);
    } catch { toast.error("Failed to remove holding"); }
    finally { setDeletingId(null); }
  }

  const TX_ICON: Record<string,React.ElementType> = { send:ArrowUpRight,sent:ArrowUpRight,receive:ArrowDownLeft,received:ArrowDownLeft,swap:ArrowLeftRight,buy:ArrowUpRight };
  const TX_COLOR: Record<string,string> = { send:"#f75f7b",sent:"#f75f7b",receive:"#22d3a5",received:"#22d3a5",swap:"#4f8ef7",buy:"#22d3a5" };

  const activeHoldings = holdings.filter(h => h.quantity > 0);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060d1f" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <GlobalMarketBar /><TickerBar />
        <TopNav title="Portfolio" subtitle="Manage your holdings" />
        <main className="flex-1 overflow-y-auto px-3 md:px-5 py-4">
          <motion.div variants={staggerContainer} initial="hidden" animate="show"
            className="max-w-[1200px] mx-auto flex flex-col gap-4">

            {/* KPI strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label:"Total Value", value:formatCurrency(totalValue),                              color:"#4f8ef7" },
                { label:"Total P&L",   value:`${isPositive?"+":""}${formatCurrency(totalPnL)}`,       color:isPositive?"#22d3a5":"#f75f7b" },
                { label:"Return",      value:`${isPositive?"+":""}${totalPnLPct.toFixed(2)}%`,        color:isPositive?"#22d3a5":"#f75f7b" },
              ].map(({ label, value, color }) => (
                <motion.div key={label} variants={fadeUp} className="glass-card p-3 sm:p-4">
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: "#6b7fa8" }}>{label}</p>
                  <p className="text-base sm:text-xl font-bold truncate" style={{ color }}>{isLoading?"—":value}</p>
                </motion.div>
              ))}
            </div>

            {/* Tabs + actions */}
            <motion.div variants={fadeUp} className="flex items-center justify-between gap-2">
              <div className="flex gap-1 p-0.5 rounded-xl" style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                {(["holdings","transactions"] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="relative px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize"
                    style={{ color: activeTab===tab?"#fff":"#6b7fa8" }}>
                    {activeTab===tab && (
                      <motion.div layoutId="portfolio-tab" className="absolute inset-0 rounded-lg"
                        style={{ background:"#4f8ef7" }} transition={{ duration:0.2 }} />
                    )}
                    <span className="relative z-10">{tab}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <motion.button whileTap={{ scale:0.88, rotate:180 }} transition={{ duration:0.4 }} onClick={() => refetch()} className="btn-icon">
                  <RefreshCw size={14}/>
                </motion.button>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.96 }}
                  onClick={() => { setEditHolding(null); setShowAddModal(true); }}
                  className="btn-primary text-xs px-3 sm:px-4 py-2">
                  <Plus size={13}/><span className="hidden sm:inline">Add Holding</span>
                </motion.button>
              </div>
            </motion.div>

            {isError && <ErrorState variant="fetch" compact onRetry={() => refetch()} />}

            <AnimatePresence mode="wait">
              {activeTab === "holdings" && (
                <motion.div key="holdings" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity:0 }}
                  className="glass-card overflow-hidden">

                  {/* Desktop table header */}
                  <div className="hidden md:grid items-center gap-4 px-5 py-3 border-b text-[10px] font-semibold uppercase tracking-widest"
                    style={{ gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px 80px", borderColor:"rgba(255,255,255,0.06)", color:"#3d5070" }}>
                    <span>Asset</span><span>Price</span><span>Holdings</span><span>Value</span><span>P&L</span><span>24h</span><span>Actions</span>
                  </div>

                  {isLoading ? (
                    Array.from({length:4}).map((_,i) => <div key={i} className="px-4 border-b" style={{ borderColor:"rgba(255,255,255,0.04)" }}><CoinRowSkeleton/></div>)
                  ) : activeHoldings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <BarChart2 size={36} className="mb-3" style={{ color:"#3d5070" }}/>
                      <p className="text-sm font-medium text-white mb-1">No holdings yet</p>
                      <p className="text-xs mb-4" style={{ color:"#6b7fa8" }}>Add your first asset to start tracking</p>
                      <motion.button whileTap={{ scale:0.96 }} onClick={() => setShowAddModal(true)}
                        className="btn-primary text-xs px-4 py-2"><Plus size={13}/>Add Holding</motion.button>
                    </div>
                  ) : activeHoldings.map(h => {
                      const sparkData = h.sparkline.map((v,i) => ({i,v}));
                      const pos24h = h.priceChangePct24h >= 0;
                      const posPnL = h.pnl >= 0;
                      return (
                        <motion.div key={h.id} layout>
                          {/* Desktop row */}
                          <div className="hidden md:grid items-center gap-4 px-5 py-3.5 border-b hover:bg-white/[0.02] transition-colors"
                            style={{ gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 80px 80px", borderColor:"rgba(255,255,255,0.04)" }}>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                style={{ background:h.bgColor, color:h.color }}>{h.symbol.slice(0,2)}</div>
                              <div><p className="text-sm font-semibold text-white">{h.symbol}</p>
                                <p className="text-xs" style={{ color:"#6b7fa8" }}>{h.name}</p></div>
                            </div>
                            <motion.p key={h.currentPrice.toFixed(2)} initial={{ color:pos24h?"#22d3a5":"#f75f7b" }} animate={{ color:"#e8edf8" }} transition={{ duration:1.5 }} className="text-sm font-semibold">{formatCurrency(h.currentPrice)}</motion.p>
                            <div><p className="text-sm text-white">{h.quantity.toFixed(4)}</p>{h.avgBuyPrice>0&&<p className="text-[10px]" style={{ color:"#6b7fa8" }}>avg {formatCurrency(h.avgBuyPrice)}</p>}</div>
                            <p className="text-sm font-semibold text-white">{formatCurrency(h.currentValue)}</p>
                            <div><p className="text-sm font-semibold" style={{ color:posPnL?"#22d3a5":"#f75f7b" }}>{posPnL?"+":""}{formatCurrency(h.pnl)}</p><p className="text-[10px]" style={{ color:posPnL?"#22d3a5":"#f75f7b" }}>{formatPercent(h.pnlPct)}</p></div>
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="h-6 w-16"><ResponsiveContainer width="100%" height="100%"><LineChart data={sparkData}><Line type="monotone" dataKey="v" stroke={pos24h?"#22d3a5":"#f75f7b"} strokeWidth={1.5} dot={false} isAnimationActive={false}/></LineChart></ResponsiveContainer></div>
                              <p className="text-[10px] font-semibold" style={{ color:pos24h?"#22d3a5":"#f75f7b" }}>{formatPercent(h.priceChangePct24h)}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <motion.button whileTap={{ scale:0.88 }} onClick={() => { setEditHolding(h); setShowAddModal(true); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color:"#6b7fa8" }}><Pencil size={12}/></motion.button>
                              <motion.button whileTap={{ scale:0.88 }} onClick={() => handleDelete(h)} disabled={deletingId===h.id}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors disabled:opacity-40" style={{ color:"#f75f7b" }}>
                                {deletingId===h.id?<Loader2 size={12} className="animate-spin"/>:<Trash2 size={12}/>}
                              </motion.button>
                            </div>
                          </div>

                          {/* Mobile card */}
                          <div className="md:hidden flex items-center gap-3 p-4 border-b" style={{ borderColor:"rgba(255,255,255,0.04)" }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                              style={{ background:h.bgColor, color:h.color }}>{h.symbol.slice(0,2)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-white">{h.symbol}</p>
                                <p className="text-sm font-bold text-white">{formatCurrency(h.currentValue)}</p>
                              </div>
                              <div className="flex items-center justify-between mt-0.5">
                                <p className="text-xs" style={{ color:"#6b7fa8" }}>{h.quantity.toFixed(4)} @ {formatCurrency(h.currentPrice)}</p>
                                <p className="text-xs font-semibold" style={{ color:h.pnl>=0?"#22d3a5":"#f75f7b" }}>
                                  {h.pnl>=0?"+":""}{formatCurrency(h.pnl)} ({formatPercent(h.pnlPct)})
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <motion.button whileTap={{ scale:0.88 }} onClick={() => { setEditHolding(h); setShowAddModal(true); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color:"#6b7fa8" }}><Pencil size={12}/></motion.button>
                              <motion.button whileTap={{ scale:0.88 }} onClick={() => handleDelete(h)} disabled={deletingId===h.id}
                                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/10 transition-colors disabled:opacity-40" style={{ color:"#f75f7b" }}>
                                {deletingId===h.id?<Loader2 size={12} className="animate-spin"/>:<Trash2 size={12}/>}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  }
                </motion.div>
              )}

              {activeTab === "transactions" && (
                <motion.div key="transactions" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity:0 }}
                  className="glass-card overflow-hidden">
                  <div className="hidden sm:grid items-center gap-4 px-5 py-3 border-b text-[10px] font-semibold uppercase tracking-widest"
                    style={{ gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", borderColor:"rgba(255,255,255,0.06)", color:"#3d5070" }}>
                    <span>Transaction</span><span>Asset</span><span>Amount</span><span>Price</span><span>Date</span>
                  </div>
                  {isLoading ? Array.from({length:5}).map((_,i)=><div key={i} className="px-4"><TxRowSkeleton/></div>)
                    : transactions.length===0
                    ? <div className="flex flex-col items-center justify-center py-14"><p className="text-sm" style={{ color:"#6b7fa8" }}>No transactions yet</p></div>
                    : transactions.map(tx => {
                        const isIncome = ["receive","received","buy"].includes(tx.type);
                        const Icon  = TX_ICON[tx.type]??ArrowLeftRight;
                        const color = TX_COLOR[tx.type]??"#6b7fa8";
                        return (
                          <div key={tx.id} className="flex sm:grid items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 border-b"
                            style={{ gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", borderColor:"rgba(255,255,255,0.04)" }}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${color}15` }}><Icon size={13} style={{ color }}/></div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white capitalize">{tx.type}</p>
                                <p className="text-[10px] font-mono truncate" style={{ color:"#3d5070" }}>{tx.txHash??(tx.cardLast4?`•••• ${tx.cardLast4}`:"—")}</p>
                              </div>
                            </div>
                            <span className="text-sm text-white hidden sm:block">{tx.symbol}</span>
                            <div className="ml-auto sm:ml-0 text-right sm:text-left">
                              <p className="text-sm font-semibold" style={{ color:isIncome?"#22d3a5":"#f75f7b" }}>{isIncome?"+":"-"}{tx.quantity.toFixed(4)} {tx.symbol}</p>
                              <p className="text-xs sm:hidden" style={{ color:"#6b7fa8" }}>{formatDate(tx.date)}</p>
                            </div>
                            <p className="text-sm text-white hidden sm:block">{formatCurrency(tx.price)}</p>
                            <p className="text-xs hidden sm:block" style={{ color:"#6b7fa8" }}>{formatDate(tx.date)}</p>
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
      <AddHoldingModal open={showAddModal} onClose={() => { setShowAddModal(false); setEditHolding(null); }} editing={editHolding}/>
      <SendModal/><CoinDetailModal/>
    </div>
  );
}
