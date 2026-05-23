import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Variants } from "framer-motion";

// ─── Tailwind class merger ──────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Number helpers ─────────────────────────────────────────────────────────
export function formatCurrency(value: number, decimals = 2): string {
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1e9).toFixed(decimals)}B`;
  if (Math.abs(value) >= 1_000_000)     return `$${(value / 1e6).toFixed(decimals)}M`;
  if (Math.abs(value) >= 1_000)         return `$${(value / 1e3).toFixed(1)}K`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function formatCrypto(value: number, symbol: string): string {
  const decimals = value < 1 ? 4 : value < 100 ? 3 : 2;
  return `${value.toFixed(decimals)} ${symbol}`;
}

export function formatCompactNumber(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

// ─── Date helpers ────────────────────────────────────────────────────────────
export function formatDate(iso: string, style: "short" | "long" | "time" = "short"): string {
  const d = new Date(iso);
  if (style === "time") {
    return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" }).format(d);
  }
  if (style === "long") {
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
  }
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export function formatTimeAgo(iso: string): string {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs <  60)  return `${secs}s ago`;
  if (secs <  3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs <  86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

// ─── Framer Motion reusable variants ───────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.3 } },
};

export const staggerContainer: Variants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show:   { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  show:   { opacity: 1, x: 0,   transition: { duration: 0.4, ease: "easeOut" } },
};

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.2 } },
  exit:   { opacity: 0, transition: { duration: 0.2 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  show:   { opacity: 1, scale: 1,    y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:   { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.2 } },
};
