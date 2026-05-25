"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Plus, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Wifi } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { TickerBar } from "@/components/layout/TickerBar";
import { SendModal } from "@/components/modals/SendModal";
import { ReceiveModal } from "@/components/modals/ReceiveModal";
import { useWalletStore } from "@/store/walletStore";
import { formatCurrency, formatDate, staggerContainer, fadeUp } from "@/lib/utils";
import { useCoins } from "@/hooks/useCoins";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";

const CARD_GRADIENTS: Record<string, string> = {
  visa: "linear-gradient(135deg, #0d1e42 0%, #1e3a7e 100%)",
  mastercard: "linear-gradient(135deg, #1a0d2e 0%, #6c1e7e 100%)",
  amex: "linear-gradient(135deg, #0d2e1e 0%, #0d6e4e 100%)",
};

export default function PaymentsPage() {
  useCoins();
  useBinanceWebSocket();
  const transactions = useWalletStore((s) => s.transactions);
  const cards = useWalletStore((s) => s.paymentCards);
  const [activeCard, setActiveCard] = useState(cards[0]?.id);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060d1f" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <TickerBar />
        <TopNav title="Payments" subtitle="Manage your cards & transactions" />
        <main className="flex-1 overflow-y-auto px-3 md:px-6 py-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">

            {/* Left — Cards */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Linked Cards</p>
                <button className="flex items-center gap-1.5 text-xs font-medium text-accent-blue hover:underline">
                  <Plus size={12} /> Add card
                </button>
              </div>

              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-3">
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    variants={fadeUp}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveCard(card.id)}
                    className="relative rounded-2xl p-5 cursor-pointer overflow-hidden"
                    style={{
                      background: CARD_GRADIENTS[card.brand],
                      border: `1px solid ${activeCard === card.id ? "rgba(79,142,247,0.5)" : "rgba(255,255,255,0.1)"}`,
                      boxShadow: activeCard === card.id ? "0 0 0 1px rgba(79,142,247,0.3), 0 8px 32px rgba(0,0,0,0.4)" : "none",
                    }}
                  >
                    {/* Contactless icon */}
                    <Wifi size={18} className="absolute top-4 right-4 opacity-40 text-white rotate-90" />

                    {/* Card type */}
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60 text-white mb-6">
                      {card.brand}
                    </p>

                    {/* Card number */}
                    <p className="font-mono text-sm tracking-widest text-white/80 mb-4">
                      •••• •••• •••• {card.last4}
                    </p>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-white/50 mb-0.5">Card Holder</p>
                        <p className="text-sm font-semibold text-white">{card.holder}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wide text-white/50 mb-0.5">Expires</p>
                        <p className="text-sm font-semibold text-white font-mono">{card.expiry}</p>
                      </div>
                    </div>

                    {card.isDefault && (
                      <span className="absolute top-4 left-4 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(34,211,165,0.2)", color: "#22d3a5" }}>
                        Default
                      </span>
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Quick stats */}
              <div className="glass-card p-4 grid grid-cols-2 gap-3">
                {[
                  { label: "Total Sent",     value: formatCurrency(7300), color: "#f75f7b" },
                  { label: "Total Received", value: formatCurrency(4200), color: "#22d3a5" },
                  { label: "This Month",     value: formatCurrency(2500), color: "#4f8ef7" },
                  { label: "Avg. Tx",        value: formatCurrency(840),  color: "#f7c948" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: "#6b7fa8" }}>{label}</p>
                    <p className="text-sm font-bold" style={{ color }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Transactions */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold text-white mb-4">All Transactions</p>
              <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-2">
                {transactions.map((tx, i) => {
                  const isIncome = tx.type === "received" || tx.type === "buy";
                  const Icon = tx.type === "sent" ? ArrowUpRight : tx.type === "received" ? ArrowDownLeft : ArrowLeftRight;
                  const color = isIncome ? "#22d3a5" : tx.type === "swap" ? "#4f8ef7" : "#f75f7b";
                  const bg    = isIncome ? "rgba(34,211,165,0.1)" : tx.type === "swap" ? "rgba(79,142,247,0.1)" : "rgba(247,95,123,0.1)";
                  return (
                    <motion.div
                      key={tx.id}
                      variants={fadeUp}
                      whileHover={{ x: 3 }}
                      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                        <Icon size={15} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white capitalize">{tx.type} {tx.asset}</p>
                        <p className="text-[10px] font-mono truncate" style={{ color: "#6b7fa8" }}>
                          {tx.hash ?? `•••• •••• •••• ${tx.cardLast4}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold" style={{ color: isIncome ? "#22d3a5" : "#f75f7b" }}>
                          {isIncome ? "+" : "-"}{formatCurrency(tx.usdValue)}
                        </p>
                        <p className="text-[10px]" style={{ color: "#6b7fa8" }}>{formatDate(tx.date)}</p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: tx.status === "completed" ? "#22d3a5" : tx.status === "pending" ? "#f7c948" : "#f75f7b" }} />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </main>
      </div>
      <SendModal />
      <ReceiveModal />
    </div>
  );
}
