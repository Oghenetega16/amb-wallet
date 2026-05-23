"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Shield, MessageCircle, ChevronDown, Search,
  Zap, Globe, HelpCircle, ArrowRight,
} from "lucide-react";
import { Sidebar }   from "@/components/layout/Sidebar";
import { TopNav }    from "@/components/layout/TopNav";
import { TickerBar } from "@/components/layout/TickerBar";
import { staggerContainer, fadeUp } from "@/lib/utils";

const FAQS = [
  { q: "How do I send cryptocurrency?",           a: "Navigate to the Dashboard, click the 'Send' button in the Overall card, select your asset, enter the recipient's wallet address, specify the amount, and confirm the transaction." },
  { q: "What network fees do I pay?",             a: "Network fees (gas fees) are dynamic and depend on blockchain congestion. AmbWallet shows you the estimated fee before you confirm any transaction. Our platform fee is 0.1% of the transaction value." },
  { q: "How do I receive crypto?",                a: "Click 'Receive' on the Dashboard, select the asset network, and share your wallet address or QR code with the sender. Funds typically arrive within minutes to an hour depending on the network." },
  { q: "Is my wallet self-custodial?",            a: "Yes. AmbWallet is a non-custodial wallet — you hold your private keys. We never have access to your funds. Your 12-word recovery phrase is the only way to restore access." },
  { q: "How do I enable two-factor auth?",        a: "Go to Settings → Security → Two-Factor Authentication. Download an authenticator app like Google Authenticator, scan the QR code, and enter the 6-digit code to confirm." },
  { q: "Why is my transaction pending?",          a: "Pending transactions are waiting to be confirmed by the network. This can take from minutes to hours depending on the fee paid and network congestion. You can speed up transactions by paying a higher gas fee." },
  { q: "Can I recover a failed transaction?",     a: "Failed transactions do not deduct your funds — they remain in your wallet. Network fees may still be charged. If a transaction fails repeatedly, try increasing the gas fee." },
  { q: "What blockchains are supported?",         a: "AmbWallet currently supports Bitcoin, Ethereum (ERC-20), Solana, Litecoin, Ripple (XRP), and Polkadot. More networks are being added regularly." },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp}
      className="border-b last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full py-4 text-left gap-4 group"
      >
        <span className="text-sm font-medium text-white group-hover:text-accent-blue transition-colors">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown size={15} style={{ color: "#6b7fa8" }} />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-sm pb-4 leading-relaxed" style={{ color: "#6b7fa8" }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const filtered = FAQS.filter((f) =>
    f.q.toLowerCase().includes(query.toLowerCase()) ||
    f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060d1f" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <TickerBar />
        <TopNav title="Help & Support" subtitle="Find answers and get help" />

        <main className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div
            variants={staggerContainer} initial="hidden" animate="show"
            className="max-w-3xl mx-auto flex flex-col gap-5"
          >

            {/* Search */}
            <motion.div variants={fadeUp} className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#3d5070" }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search help articles..."
                className="field-input pl-10 py-3 text-sm w-full"
              />
            </motion.div>

            {/* Quick links */}
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: BookOpen,        label: "Getting Started",  color: "#4f8ef7", bg: "rgba(79,142,247,0.1)" },
                { icon: Shield,          label: "Security",         color: "#22d3a5", bg: "rgba(34,211,165,0.1)" },
                { icon: Zap,             label: "Transactions",     color: "#f7c948", bg: "rgba(247,201,72,0.1)" },
                { icon: MessageCircle,   label: "Live Chat",        color: "#7b5cf0", bg: "rgba(123,92,240,0.1)" },
              ].map(({ icon: Icon, label, color, bg }) => (
                <motion.button
                  key={label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass-card p-4 flex flex-col items-center gap-2 text-center cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <p className="text-xs font-medium text-white">{label}</p>
                </motion.button>
              ))}
            </motion.div>

            {/* FAQs */}
            <motion.div variants={fadeUp} className="glass-card p-5">
              <h3 className="text-sm font-semibold text-white mb-1">Frequently Asked Questions</h3>
              <p className="text-xs mb-4" style={{ color: "#6b7fa8" }}>{filtered.length} articles</p>
              {filtered.length > 0 ? (
                filtered.map((faq, i) => <FAQItem key={i} {...faq} index={i} />)
              ) : (
                <div className="text-center py-8">
                  <HelpCircle size={32} className="mx-auto mb-2" style={{ color: "#3d5070" }} />
                  <p className="text-sm" style={{ color: "#6b7fa8" }}>No results for "{query}"</p>
                </div>
              )}
            </motion.div>

            {/* Contact */}
            <motion.div variants={fadeUp}
              className="glass-card p-5 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, rgba(79,142,247,0.08), rgba(123,92,240,0.08))" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(79,142,247,0.15)" }}>
                  <MessageCircle size={18} className="text-accent-blue" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Still need help?</p>
                  <p className="text-xs" style={{ color: "#6b7fa8" }}>Our support team responds in under 2 hours</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary text-sm px-4 py-2.5 flex items-center gap-1.5"
              >
                Chat Now <ArrowRight size={13} />
              </motion.button>
            </motion.div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
