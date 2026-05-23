"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, Sector, ResponsiveContainer, Tooltip } from "recharts";
import { useWalletStore } from "@/store/walletStore";
import { formatCurrency, formatPercent, fadeUp } from "@/lib/utils";

// ─── Active shape ──────────────────────────────────────────────────────────
function ActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 14}
        startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
    </g>
  );
}

export function PortfolioAllocation() {
  const coins      = useWalletStore((s) => s.coins);
  const portfolio  = useWalletStore((s) => s.portfolio);
  const [active, setActive] = useState(0);

  const data = useMemo(() =>
    coins.map((c) => ({
      name:    c.symbol,
      value:   c.value,
      pct:     (c.value / portfolio.totalValue) * 100,
      color:   c.color,
      bgColor: c.bgColor,
      coin:    c,
    })),
    [coins, portfolio.totalValue]
  );

  const activeDatum = data[active];

  return (
    <motion.div variants={fadeUp} className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Allocation</h3>
          <p className="text-xs mt-0.5" style={{ color: "#6b7fa8" }}>Portfolio breakdown</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={46} outerRadius={64}
                dataKey="value"
                activeIndex={active}
                activeShape={<ActiveShape />}
                onMouseEnter={(_, index) => setActive(index)}
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={entry.name} fill={entry.color} opacity={i === active ? 1 : 0.55} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-xs font-bold text-white leading-none">
                  {activeDatum?.name}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "#6b7fa8" }}>
                  {activeDatum?.pct.toFixed(1)}%
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {data.map((d, i) => (
            <motion.div
              key={d.name}
              onMouseEnter={() => setActive(i)}
              className="flex items-center gap-2 cursor-pointer group"
              whileHover={{ x: 2 }}
            >
              <div className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200 group-hover:scale-125"
                style={{ background: d.color }} />
              <span className="text-xs font-medium text-white flex-1 min-w-0 truncate">{d.name}</span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: d.color }}>
                {d.pct.toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Value strip */}
      <div className="mt-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex justify-between text-xs"
          >
            <span style={{ color: "#6b7fa8" }}>{activeDatum?.coin.name} holdings</span>
            <span className="font-semibold text-white">{formatCurrency(activeDatum?.value ?? 0)}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
