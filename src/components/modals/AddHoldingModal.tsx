"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, AlertCircle, ChevronDown, Loader2, Check } from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, modalOverlay, modalContent } from "@/lib/utils";
import toast from "react-hot-toast";
import type { EnrichedHolding } from "@/hooks/usePortfolio";

interface AddHoldingModalProps {
  open:     boolean;
  onClose:  () => void;
  editing?: EnrichedHolding | null;
}

export function AddHoldingModal({ open, onClose, editing }: AddHoldingModalProps) {
  const coins = useWalletStore(s => s.coins);
  const qc    = useQueryClient();

  const [coinId,      setCoinId]      = useState(editing?.coinId ?? "bitcoin");
  const [quantity,    setQuantity]    = useState(editing ? String(editing.quantity) : "");
  const [avgBuyPrice, setAvgBuyPrice] = useState(editing ? String(editing.avgBuyPrice) : "");
  const [loading,     setLoading]     = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});

  useEffect(() => {
    if (editing) { setCoinId(editing.coinId); setQuantity(String(editing.quantity)); setAvgBuyPrice(String(editing.avgBuyPrice)); }
    else { setCoinId("bitcoin"); setQuantity(""); setAvgBuyPrice(""); }
    setErrors({});
  }, [editing, open]);

  const selectedCoin  = coins.find(c => c.id === coinId);
  const qty           = parseFloat(quantity  || "0");
  const price         = parseFloat(avgBuyPrice || "0");
  const costBasis     = qty * price;
  const currentValue  = qty * (selectedCoin?.price ?? 0);
  const unrealisedPnL = currentValue - costBasis;

  function validate() {
    const errs: Record<string, string> = {};
    if (qty <= 0 || isNaN(qty))    errs.quantity    = "Enter a valid quantity";
    if (price < 0 || isNaN(price)) errs.avgBuyPrice = "Enter a valid buy price";
    setErrors(errs);
    return !Object.keys(errs).length;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coinId,
          symbol:      selectedCoin?.symbol ?? coinId.toUpperCase(),
          name:        selectedCoin?.name   ?? coinId,
          quantity:    qty,
          avgBuyPrice: price,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      qc.invalidateQueries({ queryKey: ["portfolio"] });
      toast.success(`${editing ? "Updated" : "Added"} ${selectedCoin?.symbol ?? coinId} holding`);
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div variants={modalOverlay} initial="hidden" animate="show" exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(6,13,31,0.88)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div variants={modalContent} initial="hidden" animate="show" exit="exit"
            className="relative w-full max-w-md rounded-3xl p-6"
            style={{ background: "#0d1730", border: "1px solid rgba(255,255,255,0.1)" }}>

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">{editing ? "Edit Holding" : "Add Holding"}</h2>
                <p className="text-xs mt-0.5" style={{ color: "#6b7fa8" }}>
                  {editing ? "Update quantity or cost basis" : "Add a new asset to your portfolio"}
                </p>
              </div>
              <motion.button whileTap={{ scale: 0.88 }} onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-[#6b7fa8] hover:text-white">
                <X size={15} />
              </motion.button>
            </div>

            {/* Asset selector */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Asset</label>
              <div className="relative">
                <select value={coinId} onChange={e => { setCoinId(e.target.value); setAvgBuyPrice(""); }}
                  disabled={!!editing} className="field-input appearance-none pr-8 cursor-pointer disabled:opacity-60">
                  {coins.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b7fa8" }} />
              </div>
            </div>

            {/* Current price chip */}
            {selectedCoin && (
              <motion.div key={coinId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center justify-between px-3 py-2 rounded-xl mb-4"
                style={{ background: "rgba(79,142,247,0.06)", border: "1px solid rgba(79,142,247,0.12)" }}>
                <span className="text-xs" style={{ color: "#6b7fa8" }}>Current price</span>
                <span className="text-xs font-semibold text-accent-blue">{formatCurrency(selectedCoin.price)}</span>
              </motion.div>
            )}

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Quantity</label>
              <input type="number" step="any" min="0" value={quantity}
                onChange={e => { setQuantity(e.target.value); setErrors(p => ({ ...p, quantity: "" })); }}
                placeholder={`e.g. 0.5 ${selectedCoin?.symbol ?? ""}`}
                className={`field-input ${errors.quantity ? "border-accent-red" : ""}`} />
              {errors.quantity && (
                <p className="flex items-center gap-1 text-xs mt-1 text-accent-red"><AlertCircle size={11} />{errors.quantity}</p>
              )}
            </div>

            {/* Avg buy price */}
            <div className="mb-5">
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6b7fa8" }}>
                Avg Buy Price (USD) <span style={{ color: "#3d5070" }}>— optional</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: "#3d5070" }}>$</span>
                <input type="number" step="any" min="0" value={avgBuyPrice}
                  onChange={e => { setAvgBuyPrice(e.target.value); setErrors(p => ({ ...p, avgBuyPrice: "" })); }}
                  placeholder="0.00" className={`field-input pl-7 ${errors.avgBuyPrice ? "border-accent-red" : ""}`} />
              </div>
              {errors.avgBuyPrice && (
                <p className="flex items-center gap-1 text-xs mt-1 text-accent-red"><AlertCircle size={11} />{errors.avgBuyPrice}</p>
              )}
            </div>

            {/* Preview */}
            {qty > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="mb-5 rounded-xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="px-4 py-3 flex flex-col gap-2 text-xs">
                  {price > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: "#6b7fa8" }}>Cost basis</span>
                      <span className="text-white font-medium">{formatCurrency(costBasis)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={{ color: "#6b7fa8" }}>Current value</span>
                    <span className="text-white font-medium">{formatCurrency(currentValue)}</span>
                  </div>
                  {price > 0 && (
                    <div className="flex justify-between pt-1.5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "#6b7fa8" }}>Unrealised P&L</span>
                      <span className="font-semibold" style={{ color: unrealisedPnL >= 0 ? "#22d3a5" : "#f75f7b" }}>
                        {unrealisedPnL >= 0 ? "+" : ""}{formatCurrency(unrealisedPnL)}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
              onClick={handleSubmit} disabled={loading}
              className="btn-primary w-full py-3 text-sm disabled:opacity-60">
              {loading
                ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" />Saving...</span>
                : editing
                  ? <span className="flex items-center gap-2"><Check size={14} />Update Holding</span>
                  : <span className="flex items-center gap-2"><Plus size={14} />Add to Portfolio</span>
              }
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
