"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, Lightbulb, ShieldCheck, ChevronDown, Loader2 } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useGlobalMarket } from "@/hooks/useGlobalMarket";
import { fadeUp } from "@/lib/utils";
import type { InsightRequest } from "@/app/api/ai/insights/route";

const SECTIONS = [
  { heading: "Portfolio Snapshot",      icon: TrendingUp,  color: "#4f8ef7", bg: "rgba(79,142,247,0.1)"  },
  { heading: "Key Observations",        icon: Lightbulb,   color: "#f7c948", bg: "rgba(247,201,72,0.1)"  },
  { heading: "Rebalancing Suggestions", icon: RefreshCw,   color: "#22d3a5", bg: "rgba(34,211,165,0.1)"  },
  { heading: "Risk Assessment",         icon: ShieldCheck, color: "#f75f7b", bg: "rgba(247,95,123,0.1)"  },
];

function parseSection(text: string, heading: string): string {
  const regex = new RegExp(`##\\s*${heading}\\s*\\n([\\s\\S]*?)(?=##|$)`, "i");
  return text.match(regex)?.[1]?.trim() ?? "";
}

function SectionCard({ heading, icon: Icon, color, bg, content, streaming }: {
  heading: string; icon: React.ElementType; color: string;
  bg: string; content: string; streaming: boolean;
}) {
  const lines = content.split("\n").map(l => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: content ? 1 : 0.4, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-xl p-3 sm:p-3.5"
      style={{ background: bg, border: `1px solid ${color}22` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
          <Icon size={12} style={{ color }} />
        </div>
        <p className="text-xs font-semibold" style={{ color }}>{heading}</p>
        {streaming && !content && <Loader2 size={10} className="animate-spin ml-auto" style={{ color }} />}
      </div>
      {content ? (
        lines.length > 1 ? (
          <ul className="flex flex-col gap-1.5">
            {lines.map((line, i) => (
              <motion.li key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }} className="flex items-start gap-1.5 text-xs leading-relaxed text-white">
                <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
                {line}
              </motion.li>
            ))}
          </ul>
        ) : <p className="text-xs leading-relaxed text-white">{lines[0]}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {[0.7, 0.5, 0.6].map((w, i) => (
            <div key={i} className="h-2.5 rounded animate-pulse"
              style={{ background: `${color}15`, width: `${w * 100}%` }} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function AIInsights() {
  const coins     = useWalletStore(s => s.coins);
  const portfolio = useWalletStore(s => s.portfolio);
  const { data: globalMarket } = useGlobalMarket();
  const { holdings: dbHoldings } = usePortfolio();

  const [text,      setText]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [lastRun,   setLastRun]   = useState<Date | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const buildPayload = useCallback((): InsightRequest => {
    const totalValue = portfolio.totalValue || 1;
    const holdings = coins.map(coin => {
      const db = dbHoldings.find(h => h.coinId === coin.id);
      return {
        symbol: coin.symbol, name: coin.name, quantity: coin.quantity,
        currentPrice: coin.price, currentValue: coin.value,
        pnl: db?.pnl ?? 0, pnlPct: db?.pnlPct ?? 0,
        priceChangePct24h: coin.priceChangePct24h,
        allocationPct: (coin.value / totalValue) * 100,
      };
    });
    return {
      portfolio: {
        totalValue: portfolio.totalValue, totalCost: portfolio.totalCost,
        totalPnL: portfolio.totalPnL, totalPnLPct: portfolio.totalPnLPct,
        change24h: portfolio.change24h, change24hPct: portfolio.change24hPct,
      },
      holdings,
      globalMarket: globalMarket ? {
        btcDominance: globalMarket.btc_dominance,
        totalMarketCapUsd: globalMarket.total_market_cap_usd,
        marketCapChangePct24h: globalMarket.market_cap_change_pct,
      } : undefined,
    };
  }, [coins, portfolio, dbHoldings, globalMarket]);

  async function runAnalysis() {
    if (loading) { abortRef.current?.abort(); return; }
    setLoading(true); setError(""); setText("");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()), signal: controller.signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setText(prev => prev + decoder.decode(value, { stream: true }));
      }
      setLastRun(new Date());
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setError(err.message ?? "Analysis failed");
    } finally { setLoading(false); }
  }

  const hasContent = text.length > 0;

  return (
    <motion.div variants={fadeUp} className="glass-card p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, rgba(79,142,247,0.2), rgba(123,92,240,0.2))", border: "1px solid rgba(79,142,247,0.3)" }}>
            <Sparkles size={15} className="text-accent-blue" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">AI Insights</p>
            <p className="text-[10px]" style={{ color: "#3d5070" }}>
              {lastRun ? `Analysed ${lastRun.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Powered by Claude"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasContent && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCollapsed(v => !v)} className="btn-icon">
              <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown size={14} />
              </motion.div>
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={runAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: loading ? "rgba(247,95,123,0.1)" : "linear-gradient(135deg, rgba(79,142,247,0.15), rgba(123,92,240,0.15))",
              border: `1px solid ${loading ? "rgba(247,95,123,0.3)" : "rgba(79,142,247,0.3)"}`,
              color: loading ? "#f75f7b" : "#4f8ef7",
            }}>
            {loading ? <><Loader2 size={11} className="animate-spin" />Stop</> : <><Sparkles size={11} />{hasContent ? "Re-analyse" : "Analyse"}</>}
          </motion.button>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs"
          style={{ background: "rgba(247,95,123,0.08)", border: "1px solid rgba(247,95,123,0.2)", color: "#f75f7b" }}>
          <AlertTriangle size={12} />
          {error === "ANTHROPIC_API_KEY not configured" ? "Add ANTHROPIC_API_KEY to .env.local to enable AI insights." : error}
        </motion.div>
      )}

      {!hasContent && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
            style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.15)" }}>
            <Sparkles size={20} className="text-accent-blue" />
          </div>
          <p className="text-sm font-medium text-white mb-1">Portfolio Analysis</p>
          <p className="text-xs max-w-[220px] leading-relaxed" style={{ color: "#6b7fa8" }}>
            Claude analyses your holdings, 24h performance, and market conditions for actionable insights.
          </p>
        </div>
      )}

      <AnimatePresence>
        {(hasContent || loading) && !collapsed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
            /* 1 col on mobile, 2 cols on sm+ */
            className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SECTIONS.map(({ heading, icon, color, bg }) => (
              <SectionCard key={heading} heading={heading} icon={icon} color={color} bg={bg}
                content={parseSection(text, heading)} streaming={loading} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
