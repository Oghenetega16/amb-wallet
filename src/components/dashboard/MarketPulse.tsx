"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { formatPercent, fadeUp } from "@/lib/utils";

// ─── Fear & Greed gauge ────────────────────────────────────────────────────
function FearGreedGauge({ value }: { value: number }) {
  const pct   = value / 100;
  const angle = -135 + pct * 270; // sweep from -135deg to +135deg
  const color =
    value < 25  ? "#f75f7b" :
    value < 45  ? "#f7c948" :
    value < 55  ? "#a0a0a0" :
    value < 75  ? "#22d3a5" : "#4f8ef7";
  const label =
    value < 25  ? "Extreme Fear" :
    value < 45  ? "Fear" :
    value < 55  ? "Neutral" :
    value < 75  ? "Greed" : "Extreme Greed";

  // Arc path helpers
  const r = 38;
  const cx = 56, cy = 56;
  function polarToCart(deg: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  const start = polarToCart(-135);
  const end   = polarToCart(135);
  const needle = polarToCart(angle - 90); // offset because SVG 0° is right

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={112} height={72} viewBox="0 0 112 72">
        {/* Track arc */}
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`}
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} strokeLinecap="round"
        />
        {/* Value arc (split into segments for colour gradient effect) */}
        {["#f75f7b","#f7c948","#a0a0a0","#22d3a5","#4f8ef7"].map((c, i) => {
          const segStart = polarToCart(-135 + i * 54);
          const segEnd   = polarToCart(-135 + (i + 1) * 54);
          const opacity  = (i / 4) <= pct ? 1 : 0.15;
          return (
            <path key={i}
              d={`M ${segStart.x} ${segStart.y} A ${r} ${r} 0 0 1 ${segEnd.x} ${segEnd.y}`}
              fill="none" stroke={c} strokeWidth={8} strokeLinecap="round" opacity={opacity}
            />
          );
        })}
        {/* Needle */}
        <g transform={`rotate(${angle}, ${cx}, ${cy})`}>
          <line x1={cx} y1={cy} x2={cx} y2={cy - r + 6}
            stroke={color} strokeWidth={2} strokeLinecap="round" />
        </g>
        <circle cx={cx} cy={cy} r={3} fill={color} />
        {/* Value text */}
        <text x={cx} y={cy + 18} textAnchor="middle" fill={color}
          fontSize={14} fontWeight={700} fontFamily="Poppins">
          {value}
        </text>
      </svg>
      <p className="text-xs font-semibold" style={{ color }}>{label}</p>
    </div>
  );
}

export function MarketPulse() {
  const coins     = useWalletStore((s) => s.coins);
  const fearGreed = 62; // mock

  const sorted    = [...coins].sort((a, b) => b.priceChangePct24h - a.priceChangePct24h);
  const gainers   = sorted.slice(0, 3);
  const losers    = sorted.slice(-3).reverse();

  return (
    <motion.div variants={fadeUp} className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Activity size={14} className="text-accent-blue" />
        <h3 className="text-sm font-semibold text-white">Market Pulse</h3>
      </div>

      {/* Fear & Greed */}
      <div className="flex flex-col items-center py-1 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: "#6b7fa8" }}>Fear & Greed</p>
        <FearGreedGauge value={fearGreed} />
      </div>

      {/* Gainers */}
      <div>
        <p className="text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: "#6b7fa8" }}>
          <TrendingUp size={10} className="text-accent-green" /> Top Gainers
        </p>
        <div className="flex flex-col gap-1.5">
          {gainers.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
                  style={{ background: c.bgColor, color: c.color }}>{c.symbol.slice(0, 2)}</div>
                <span className="text-xs font-medium text-white">{c.symbol}</span>
              </div>
              <span className="text-xs font-semibold text-accent-green">{formatPercent(c.priceChangePct24h)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Losers */}
      <div>
        <p className="text-[10px] uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: "#6b7fa8" }}>
          <TrendingDown size={10} className="text-accent-red" /> Top Losers
        </p>
        <div className="flex flex-col gap-1.5">
          {losers.map((c) => (
            <div key={c.id} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center"
                  style={{ background: c.bgColor, color: c.color }}>{c.symbol.slice(0, 2)}</div>
                <span className="text-xs font-medium text-white">{c.symbol}</span>
              </div>
              <span className="text-xs font-semibold text-accent-red">{formatPercent(c.priceChangePct24h)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
