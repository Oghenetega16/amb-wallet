"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Base shimmer block ──────────────────────────────────────────────────────
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg animate-pulse", className)}
      style={{ background: "rgba(255,255,255,0.06)" }}
    />
  );
}

// ─── Coin row skeleton ────────────────────────────────────────────────────────
export function CoinRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5 px-2">
      <Shimmer className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-2.5 w-12" />
      </div>
      <Shimmer className="w-16 h-8 rounded-md" />
      <div className="flex flex-col gap-1.5 items-end w-20">
        <Shimmer className="h-3 w-14" />
        <Shimmer className="h-2.5 w-10" />
      </div>
      <div className="flex flex-col gap-1.5 items-end w-20">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-2.5 w-8" />
      </div>
    </div>
  );
}

// ─── Transaction row skeleton ─────────────────────────────────────────────────
export function TxRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5 px-2">
      <Shimmer className="w-8 h-8 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-2.5 w-28 font-mono" />
      </div>
      <div className="flex flex-col gap-1.5 items-end">
        <Shimmer className="h-3 w-16" />
        <Shimmer className="h-2.5 w-20" />
      </div>
    </div>
  );
}

// ─── Metric card skeleton ─────────────────────────────────────────────────────
export function MetricCardSkeleton() {
  return (
    <div className="glass-card p-4 flex items-center gap-3">
      <Shimmer className="w-10 h-10 rounded-xl shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <Shimmer className="h-2.5 w-20" />
        <Shimmer className="h-6 w-28" />
        <Shimmer className="h-2.5 w-16" />
      </div>
    </div>
  );
}

// ─── Chart skeleton ───────────────────────────────────────────────────────────
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="w-full relative overflow-hidden rounded-xl"
      style={{ height, background: "rgba(255,255,255,0.02)" }}>
      {/* Fake axis lines */}
      {[0.25, 0.5, 0.75].map((pct) => (
        <div key={pct} className="absolute left-0 right-0 h-px"
          style={{ top: `${pct * 100}%`, background: "rgba(255,255,255,0.04)" }} />
      ))}
      {/* Shimmer wave */}
      <div className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(79,142,247,0.05) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2s ease-in-out infinite",
        }}
      />
      {/* Fake chart line silhouette */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <path
          d={`M0,${height * 0.7} C80,${height * 0.5} 160,${height * 0.8} 240,${height * 0.45}
              S400,${height * 0.3} 480,${height * 0.5} S600,${height * 0.55} 720,${height * 0.2}
              S840,${height * 0.35} 960,${height * 0.15}`}
          fill="none"
          stroke="rgba(79,142,247,0.12)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

// ─── Overall card skeleton ────────────────────────────────────────────────────
export function OverallCardSkeleton() {
  return (
    <div className="glass-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Shimmer className="h-4 w-28" />
        <Shimmer className="w-8 h-8 rounded-lg" />
      </div>
      <div className="flex flex-col gap-2">
        <Shimmer className="h-9 w-40" />
        <Shimmer className="h-5 w-24 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Shimmer className="flex-1 h-10 rounded-xl" />
        <Shimmer className="flex-1 h-10 rounded-xl" />
      </div>
      <div className="flex gap-4 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Shimmer className="w-12 h-12 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Shimmer className="h-2.5 w-12" />
              <Shimmer className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Full card skeleton (generic) ─────────────────────────────────────────────
export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-0">
      <div className="flex items-center justify-between mb-4">
        <Shimmer className="h-4 w-20" />
        <Shimmer className="h-7 w-24 rounded-lg" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <CoinRowSkeleton key={i} />
      ))}
    </div>
  );
}
