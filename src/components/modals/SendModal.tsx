"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ChevronDown, AlertCircle } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { modalOverlay, modalContent } from "@/lib/utils";
import toast from "react-hot-toast";

export function SendModal() {
  const activeModal    = useWalletStore((s) => s.activeModal);
  const coins          = useWalletStore((s) => s.coins);
  const closeModal     = useWalletStore((s) => s.closeModal);
  const addTransaction = useWalletStore((s) => s.addTransaction);
  const qc             = useQueryClient();

  const [selectedCoinId, setSelectedCoinId] = useState("ethereum");
  const [address,  setAddress]  = useState("");
  const [amount,   setAmount]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const isOpen    = activeModal === "send";
  const coin      = coins.find((c) => c.id === selectedCoinId)!;
  const usdAmount = parseFloat(amount || "0");
  const cryptoAmt = coin ? usdAmount / coin.price : 0;
  const fee       = usdAmount * 0.001;
  const total     = usdAmount + fee;

  function validate() {
    const errs: Record<string, string> = {};
    if (!address.trim())              errs.address = "Wallet address is required";
    else if (address.length < 8)      errs.address = "Invalid wallet address";
    if (!amount || usdAmount <= 0)    errs.amount  = "Enter a valid amount";
    else if (coin && usdAmount > coin.value) errs.amount = "Insufficient balance";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSend() {
    if (!validate()) return;
    setLoading(true);

    const txHash = `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`;

    try {
      // Persist to DB — best-effort, non-fatal if user not authenticated
      await fetch("/api/portfolio/transactions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinId:   coin.id,
          symbol:   coin.symbol,
          name:     coin.name,
          type:     "send",
          quantity: cryptoAmt,
          price:    coin.price,
          usdValue: usdAmount,
          fee,
          txHash,
          cardLast4: "3919",
        }),
      })
        .then(() => qc.invalidateQueries({ queryKey: ["portfolio"] }))
        .catch(() => { /* non-fatal */ });

      // Instant local store update for UI feedback
      addTransaction({
        type:      "sent",
        asset:     coin.symbol,
        amount:    cryptoAmt,
        usdValue:  usdAmount,
        to:        address,
        cardLast4: "3919",
        date:      new Date().toISOString(),
        status:    "completed",
        hash:      txHash,
      });

      closeModal();
      setAddress("");
      setAmount("");
      setErrors({});
      toast.success(`Sent ${formatCurrency(usdAmount)} in ${coin.symbol}`);
    } finally {
      setLoading(false);
    }
  }

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
            className="relative w-full max-w-md rounded-3xl p-6"
            style={{ background: "#0d1730", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Send Crypto</h2>
                <p className="text-xs mt-0.5" style={{ color: "#6b7fa8" }}>Transfer to any wallet address</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={closeModal}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-[#6b7fa8] hover:text-white"
              >
                <X size={15} />
              </motion.button>
            </div>

            {/* Asset selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#6b7fa8" }}>
                Asset
              </label>
              <div className="relative">
                <select
                  value={selectedCoinId}
                  onChange={(e) => setSelectedCoinId(e.target.value)}
                  className="field-input appearance-none pr-8 cursor-pointer"
                >
                  {coins.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b7fa8" }} />
              </div>
            </div>

            {/* Available balance */}
            {coin && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-4 px-3 py-2 rounded-xl"
                style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.12)" }}
              >
                <span className="text-xs" style={{ color: "#6b7fa8" }}>Available</span>
                <span className="text-xs font-semibold text-accent-blue">
                  {formatCurrency(coin.value)} ({coin.quantity.toFixed(4)} {coin.symbol})
                </span>
              </motion.div>
            )}

            {/* Recipient address */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#6b7fa8" }}>
                Recipient Address
              </label>
              <input
                value={address}
                onChange={(e) => { setAddress(e.target.value); setErrors((e) => ({ ...e, address: "" })); }}
                placeholder="0x1A2B3C4D..."
                className={`field-input font-mono ${errors.address ? "border-accent-red" : ""}`}
              />
              {errors.address && (
                <p className="flex items-center gap-1 text-xs mt-1 text-accent-red">
                  <AlertCircle size={11} /> {errors.address}
                </p>
              )}
            </div>

            {/* Amount */}
            <div className="mb-5">
              <label className="block text-xs font-medium mb-1.5 tracking-wide uppercase" style={{ color: "#6b7fa8" }}>
                Amount (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "#3d5070" }}>$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setErrors((e) => ({ ...e, amount: "" })); }}
                  placeholder="0.00"
                  className={`field-input pl-7 ${errors.amount ? "border-accent-red" : ""}`}
                />
              </div>
              {errors.amount && (
                <p className="flex items-center gap-1 text-xs mt-1 text-accent-red">
                  <AlertCircle size={11} /> {errors.amount}
                </p>
              )}
              {usdAmount > 0 && coin && (
                <p className="text-xs mt-1" style={{ color: "#6b7fa8" }}>
                  ≈ {cryptoAmt.toFixed(6)} {coin.symbol}
                </p>
              )}
            </div>

            {/* Fee breakdown */}
            {usdAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-5 rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="px-4 py-3 flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "#6b7fa8" }}>Amount</span>
                    <span className="text-white">{formatCurrency(usdAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "#6b7fa8" }}>Network fee</span>
                    <span className="text-white">{formatCurrency(fee)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <span style={{ color: "#6b7fa8" }}>Total</span>
                    <span className="text-accent-blue">{formatCurrency(total)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSend}
              disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                <><Send size={14} /> Send Now</>
              )}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
