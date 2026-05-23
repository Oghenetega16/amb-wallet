"use client";

import { useEffect, useRef, useCallback } from "react";
import { useWalletStore } from "@/store/walletStore";
import { COIN_META } from "@/lib/api/coingecko";
import type { BinanceTickerMsg } from "@/lib/api/types";

const WS_BASE       = "wss://stream.binance.com:9443/stream";
const MAX_RETRIES   = 6;
const BASE_DELAY_MS = 1_000;

/** Build the multi-stream URL for all tracked symbols */
function buildStreamUrl(coinIds: string[]): string {
  const streams = coinIds
    .map((id) => COIN_META[id]?.binanceSymbol?.toLowerCase())
    .filter(Boolean)
    .map((sym) => `${sym}@ticker`)
    .join("/");
  return `${WS_BASE}?streams=${streams}`;
}

/**
 * Opens a Binance WebSocket connection for live ticker prices.
 * - Auto-reconnects with exponential back-off on disconnect or error.
 * - Pauses when the browser tab is hidden (Page Visibility API).
 * - Pushes price updates directly into Zustand via `updateCoinPrice`.
 * - Gracefully stops when `isLiveUpdating` is toggled off.
 */
export function useBinanceWebSocket() {
  const isLive          = useWalletStore((s) => s.isLiveUpdating);
  const coins           = useWalletStore((s) => s.coins);
  const updateCoinPrice = useWalletStore((s) => s.updateCoinPriceById);
  const setWsStatus     = useWalletStore((s) => s.setWsStatus);

  const wsRef        = useRef<WebSocket | null>(null);
  const retriesRef   = useRef(0);
  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRef    = useRef(false);

  const coinIds = coins.map((c) => c.id);

  // ── Message handler ──────────────────────────────────────────────────────
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const msg: BinanceTickerMsg = JSON.parse(event.data as string);
        if (!msg?.data) return;

        const { s: binanceSym, c: lastPrice, P: changePct, p: change } = msg.data;

        // Find which of our tracked coins this symbol belongs to
        const coinId = Object.entries(COIN_META).find(
          ([, meta]) => meta.binanceSymbol === binanceSym
        )?.[0];

        if (!coinId) return;

        updateCoinPrice(coinId, {
          price:             parseFloat(lastPrice),
          priceChange24h:    parseFloat(change),
          priceChangePct24h: parseFloat(changePct),
        });
      } catch {
        // Malformed message — silently ignore
      }
    },
    [updateCoinPrice]
  );

  // ── Connect ──────────────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (pausedRef.current || !isLive) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = buildStreamUrl(coinIds);
    const ws  = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retriesRef.current = 0;
      setWsStatus("connected");
    };

    ws.onmessage = handleMessage;

    ws.onerror = () => {
      setWsStatus("error");
    };

    ws.onclose = (ev) => {
      setWsStatus("disconnected");
      // Don't reconnect on intentional close (code 1000) or if paused
      if (ev.code === 1000 || pausedRef.current || !isLive) return;

      if (retriesRef.current < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * 2 ** retriesRef.current;
        retriesRef.current += 1;
        timerRef.current = setTimeout(connect, delay);
      } else {
        setWsStatus("failed");
      }
    };
  }, [coinIds, handleMessage, isLive, setWsStatus]);

  // ── Disconnect ───────────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    wsRef.current?.close(1000, "intentional");
    wsRef.current = null;
  }, []);

  // ── Page visibility ───────────────────────────────────────────────────────
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        pausedRef.current = true;
        disconnect();
      } else {
        pausedRef.current = false;
        if (isLive) connect();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [connect, disconnect, isLive]);

  // ── Main effect ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLive) {
      connect();
    } else {
      disconnect();
      setWsStatus("paused");
    }

    return disconnect;
  }, [isLive, connect, disconnect, setWsStatus]);
}
