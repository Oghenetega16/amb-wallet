"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff, Loader2, AlertCircle, PauseCircle } from "lucide-react";
import { useWalletStore, selectWsStatus } from "@/store/walletStore";
import type { WsStatus } from "@/store/walletStore";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<WsStatus, {
  label:  string;
  color:  string;
  bg:     string;
  border: string;
  icon:   React.ElementType;
  pulse:  boolean;
}> = {
  idle:         { label: "Initialising", color: "#6b7fa8", bg: "rgba(107,127,168,0.08)", border: "rgba(107,127,168,0.2)", icon: Loader2,     pulse: false },
  connecting:   { label: "Connecting",   color: "#f7c948", bg: "rgba(247,201,72,0.08)",  border: "rgba(247,201,72,0.25)",  icon: Loader2,     pulse: true  },
  connected:    { label: "Live",         color: "#22d3a5", bg: "rgba(34,211,165,0.08)",  border: "rgba(34,211,165,0.25)",  icon: Wifi,        pulse: true  },
  disconnected: { label: "Reconnecting", color: "#f7c948", bg: "rgba(247,201,72,0.08)",  border: "rgba(247,201,72,0.25)",  icon: WifiOff,     pulse: false },
  error:        { label: "Error",        color: "#f75f7b", bg: "rgba(247,95,123,0.08)",  border: "rgba(247,95,123,0.25)",  icon: AlertCircle, pulse: false },
  failed:       { label: "Offline",      color: "#f75f7b", bg: "rgba(247,95,123,0.08)",  border: "rgba(247,95,123,0.25)",  icon: WifiOff,     pulse: false },
  paused:       { label: "Paused",       color: "#6b7fa8", bg: "rgba(107,127,168,0.08)", border: "rgba(107,127,168,0.2)", icon: PauseCircle, pulse: false },
};

export function WsStatusBadge() {
  const status = useWalletStore(selectWsStatus);
  const cfg    = STATUS_CONFIG[status];
  const Icon   = cfg.icon;
  const isSpinning = status === "connecting" || status === "idle";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border select-none"
        style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}
      >
        {/* Icon */}
        <motion.div animate={isSpinning ? { rotate: 360 } : {}}
          transition={isSpinning ? { duration: 1.2, repeat: Infinity, ease: "linear" } : {}}>
          <Icon size={11} />
        </motion.div>

        {/* Pulse dot for live */}
        {cfg.pulse && status === "connected" && (
          <span className="w-1.5 h-1.5 rounded-full"
            style={{ background: cfg.color, boxShadow: `0 0 4px ${cfg.color}`, animation: "livePulse 1.8s ease-in-out infinite" }} />
        )}

        <span>{cfg.label}</span>
      </motion.div>
    </AnimatePresence>
  );
}
