"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Download } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { modalOverlay, modalContent } from "@/lib/utils";
import toast from "react-hot-toast";

const WALLET_ADDRESS = "0x7Fb4aE913cD8f2a1b9c3D4e56F78A90b1C2d3E4f";

// ─── Deterministic QR-style SVG ────────────────────────────────────────────
function QRCode() {
  const size = 7;
  const cells = Array.from({ length: size * size }, (_, i) => {
    const row = Math.floor(i / size);
    const col = i % size;
    // Corner squares
    if ((row < 2 && col < 2) || (row < 2 && col >= size - 2) || (row >= size - 2 && col < 2)) return true;
    // Pseudo-random inner data
    return ((i * 17 + row * 31 + col * 7) % 3 === 0);
  });

  return (
    <div className="p-4 rounded-2xl" style={{ background: "#fff" }}>
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, width: 112, height: 112 }}
      >
        {cells.map((filled, i) => (
          <div
            key={i}
            className="rounded-[1px]"
            style={{ background: filled ? "#060d1f" : "transparent" }}
          />
        ))}
      </div>
    </div>
  );
}

export function ReceiveModal() {
  const activeModal = useWalletStore((s) => s.activeModal);
  const closeModal  = useWalletStore((s) => s.closeModal);
  const coins       = useWalletStore((s) => s.coins);
  const [copied, setCopied] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState("ethereum");

  const isOpen = activeModal === "receive";
  const coin   = coins.find((c) => c.id === selectedCoin)!;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(WALLET_ADDRESS);
    } catch {
      // fallback for environments without clipboard API
    }
    setCopied(true);
    toast.success("Address copied!");
    setTimeout(() => setCopied(false), 2500);
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
            className="relative w-full max-w-sm rounded-3xl p-6 text-center"
            style={{ background: "#0d1730", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Close */}
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={closeModal}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10 text-[#6b7fa8] hover:text-white"
            >
              <X size={15} />
            </motion.button>

            <h2 className="text-lg font-bold text-white mb-1">Receive Crypto</h2>
            <p className="text-xs mb-5" style={{ color: "#6b7fa8" }}>Share your address to receive funds</p>

            {/* Network selector */}
            <div className="flex justify-center gap-2 mb-5">
              {coins.slice(0, 4).map((c) => (
                <motion.button
                  key={c.id}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedCoin(c.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: selectedCoin === c.id ? c.bgColor : "rgba(255,255,255,0.04)",
                    color: selectedCoin === c.id ? c.color : "#6b7fa8",
                    border: `1px solid ${selectedCoin === c.id ? c.color + "40" : "rgba(255,255,255,0.07)"}`,
                  }}
                >
                  {c.symbol}
                </motion.button>
              ))}
            </div>

            {/* QR Code */}
            <motion.div
              key={selectedCoin}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="flex justify-center mb-4"
            >
              <QRCode />
            </motion.div>

            {/* Network label */}
            {coin && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-xs font-medium"
                style={{ background: coin.bgColor, color: coin.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: coin.color }} />
                {coin.name} Network
              </div>
            )}

            {/* Address */}
            <div className="mb-5 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-mono break-all leading-relaxed" style={{ color: "#c5d0eb" }}>
                {WALLET_ADDRESS}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={copyAddress}
                className="btn-primary flex-1 py-2.5 text-sm"
              >
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.span key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-1.5">
                      <Check size={13} /> Copied!
                    </motion.span>
                  ) : (
                    <motion.span key="copy" className="flex items-center gap-1.5">
                      <Copy size={13} /> Copy Address
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="btn-secondary px-4 py-2.5 text-sm"
              >
                <Download size={14} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
