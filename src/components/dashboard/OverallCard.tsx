"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Send, Download, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useCoins } from "@/hooks/useCoins";
import { OverallCardSkeleton } from "@/components/ui/Skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useWalletStore, selectPortfolio } from "@/store/walletStore";
import { formatPercent } from "@/lib/utils";
import { fadeUp } from "@/lib/utils";

export function OverallCard() {
  const portfolio  = useWalletStore(selectPortfolio);
  const openModal  = useWalletStore((s) => s.openModal);
  const isPositive = portfolio.change24h >= 0;
  const { isLoading } = useCoins();

  if (isLoading && portfolio.totalValue === 0) return <OverallCardSkeleton />;

  const incomeData  = [
    { value: portfolio.income },
    { value: Math.max(0, portfolio.totalValue - portfolio.income) },
  ];
  const expenseData = [
    { value: portfolio.expenses },
    { value: Math.max(0, portfolio.totalValue - portfolio.expenses) },
  ];

  return (
    <motion.div
      variants={fadeUp}
      className="glass-card p-5 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white">Overall Balance</span>
        <motion.button
          whileTap={{ scale: 0.88, rotate: 180 }}
          transition={{ duration: 0.4 }}
          className="btn-icon"
        >
          <RefreshCw size={14} />
        </motion.button>
      </div>

      {/* Balance */}
      <div>
        <p className="text-3xl font-bold text-white leading-none tracking-tight">
          <span className="text-lg font-semibold mr-0.5" style={{ color: "#6b7fa8" }}>$</span>
          <CountUp
            end={portfolio.totalValue}
            decimals={2}
            duration={1.2}
            separator=","
            preserveValue
          />
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full
            ${isPositive ? "badge-up" : "badge-down"}`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {formatPercent(portfolio.change24hPct)}
          </div>
          <span className="text-xs" style={{ color: "#6b7fa8" }}>24h change</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => openModal("send")}
          className="btn-primary flex-1 text-xs py-2.5"
        >
          <Send size={13} />
          Send
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => openModal("receive")}
          className="btn-secondary flex-1 text-xs py-2.5"
        >
          <Download size={13} />
          Receive
        </motion.button>
      </div>

      {/* Mini donut stats */}
      <div className="flex items-center gap-4 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {/* Income donut */}
        <MiniDonut
          label="Income"
          value={portfolio.income}
          data={incomeData}
          activeColor="#22d3a5"
          trackColor="rgba(34,211,165,0.08)"
        />
        {/* Expense donut */}
        <MiniDonut
          label="Expense"
          value={portfolio.expenses}
          data={expenseData}
          activeColor="#f75f7b"
          trackColor="rgba(247,95,123,0.08)"
        />
      </div>
    </motion.div>
  );
}

function MiniDonut({
  label, value, data, activeColor, trackColor,
}: {
  label: string;
  value: number;
  data: { value: number }[];
  activeColor: string;
  trackColor: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-12 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={14} outerRadius={22}
              dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
              <Cell fill={activeColor} />
              <Cell fill={trackColor} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: activeColor, boxShadow: `0 0 6px ${activeColor}` }} />
        </div>
      </div>
      <div>
        <p className="text-[10px]" style={{ color: "#6b7fa8" }}>{label}</p>
        <p className="text-xs font-semibold" style={{ color: activeColor }}>
          ${value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
