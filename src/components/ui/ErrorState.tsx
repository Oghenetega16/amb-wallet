"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";

type ErrorVariant = "fetch" | "network" | "rateLimit" | "generic";

interface ErrorStateProps {
  variant?:  ErrorVariant;
  message?:  string;
  onRetry?:  () => void;
  compact?:  boolean;
}

const VARIANTS: Record<ErrorVariant, { icon: React.ElementType; title: string; sub: string; color: string; bg: string }> = {
  fetch:     { icon: AlertTriangle, title: "Failed to load data",     sub: "The request returned an error. We're showing cached data.",    color: "#f75f7b", bg: "rgba(247,95,123,0.08)"  },
  network:   { icon: WifiOff,       title: "No network connection",   sub: "Check your internet connection. Live prices are paused.",       color: "#f7c948", bg: "rgba(247,201,72,0.08)"  },
  rateLimit: { icon: AlertTriangle, title: "Rate limit reached",       sub: "Too many requests. Prices will resume in a few seconds.",       color: "#f7c948", bg: "rgba(247,201,72,0.08)"  },
  generic:   { icon: AlertTriangle, title: "Something went wrong",     sub: "An unexpected error occurred. Try refreshing the page.",        color: "#f75f7b", bg: "rgba(247,95,123,0.08)"  },
};

export function ErrorState({ variant = "generic", message, onRetry, compact = false }: ErrorStateProps) {
  const { icon: Icon, title, sub, color, bg } = VARIANTS[variant];

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{ background: bg, border: `1px solid ${color}25` }}>
        <Icon size={13} style={{ color }} />
        <p className="text-xs font-medium" style={{ color }}>{message ?? title}</p>
        {onRetry && (
          <button onClick={onRetry}
            className="ml-auto text-xs font-semibold underline transition-opacity hover:opacity-70"
            style={{ color }}>
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center rounded-2xl"
      style={{ background: bg, border: `1px solid ${color}20` }}
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: `${color}18` }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-1">{message ?? title}</p>
        <p className="text-xs" style={{ color: "#6b7fa8" }}>{sub}</p>
      </div>
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRetry}
          className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
        >
          <RefreshCw size={12} />
          Try again
        </motion.button>
      )}
    </motion.div>
  );
}
