"use client";

import { useEffect, useRef } from "react";
import { useWalletStore } from "@/store/walletStore";

/**
 * Simulates live price updates every `intervalMs` ms.
 * Automatically pauses when the tab is hidden (Page Visibility API).
 */
export function useLivePrices(intervalMs = 4000) {
  const tickAllPrices  = useWalletStore((s) => s.tickAllPrices);
  const isLive         = useWalletStore((s) => s.isLiveUpdating);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startTicker = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (!document.hidden) tickAllPrices();
      }, intervalMs);
    };

    const stopTicker = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (isLive) {
      startTicker();
      document.addEventListener("visibilitychange", () => {
        document.hidden ? stopTicker() : startTicker();
      });
    } else {
      stopTicker();
    }

    return () => {
      stopTicker();
      document.removeEventListener("visibilitychange", () => {});
    };
  }, [isLive, tickAllPrices, intervalMs]);
}
