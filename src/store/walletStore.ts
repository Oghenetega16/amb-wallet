import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { Coin, Transaction, Portfolio, ModalType, Timeframe, PaymentCard } from "@/types";
import { COINS, TRANSACTIONS, PORTFOLIO, PAYMENT_CARDS } from "@/lib/mockData";

export type WsStatus = "idle" | "connecting" | "connected" | "disconnected" | "error" | "failed" | "paused";

interface WalletState {
  coins:        Coin[];
  transactions: Transaction[];
  portfolio:    Portfolio;
  paymentCards: PaymentCard[];
  activeModal:       ModalType;
  selectedCoin:      Coin | null;
  selectedTimeframe: Timeframe;
  txFilter:          "all" | "sent" | "received";
  isSidebarOpen:     boolean;
  isLiveUpdating:    boolean;
  wsStatus:          WsStatus;
  isDataLoading:     boolean;

  setCoins:            (coins: Coin[]) => void;
  updateCoinPriceById: (id: string, patch: { price: number; priceChange24h: number; priceChangePct24h: number }) => void;
  setWsStatus:         (status: WsStatus) => void;
  setDataLoading:      (loading: boolean) => void;
  updateCoinPrice:     (id: string, newPrice: number) => void;
  tickAllPrices:       () => void;
  addTransaction:      (tx: Omit<Transaction, "id">) => void;
  openModal:           (modal: ModalType, coin?: Coin) => void;
  closeModal:          () => void;
  setTimeframe:        (tf: Timeframe) => void;
  setTxFilter:         (filter: "all" | "sent" | "received") => void;
  toggleSidebar:       () => void;
  toggleLiveUpdating:  () => void;
}

function recomputePortfolio(coins: Coin[], prev: Portfolio): Portfolio {
  const totalValue = coins.reduce((sum, c) => sum + c.value, 0);
  const change24h  = coins.reduce((sum, c) => sum + c.priceChange24h * c.quantity, 0);
  return {
    ...prev,
    totalValue,
    change24h,
    change24hPct: totalValue > 0 ? (change24h / Math.max(1, totalValue - change24h)) * 100 : 0,
    totalPnL:     totalValue - prev.totalCost,
    totalPnLPct:  prev.totalCost > 0 ? ((totalValue - prev.totalCost) / prev.totalCost) * 100 : 0,
  };
}

export const useWalletStore = create<WalletState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      coins: COINS, transactions: TRANSACTIONS, portfolio: PORTFOLIO, paymentCards: PAYMENT_CARDS,
      activeModal: null, selectedCoin: null, selectedTimeframe: "1Y",
      txFilter: "all", isSidebarOpen: true, isLiveUpdating: true,
      wsStatus: "idle", isDataLoading: false,

      setCoins: (coins) =>
        set((s) => ({ coins, portfolio: recomputePortfolio(coins, s.portfolio), isDataLoading: false })),

      updateCoinPriceById: (id, patch) =>
        set((s) => {
          const coins = s.coins.map((c) => c.id !== id ? c : {
            ...c,
            price: patch.price, value: patch.price * c.quantity,
            priceChange24h: patch.priceChange24h, priceChangePct24h: patch.priceChangePct24h,
            sparkline: [...c.sparkline.slice(1), patch.price],
          });
          return { coins, portfolio: recomputePortfolio(coins, s.portfolio) };
        }),

      setWsStatus:    (wsStatus)      => set({ wsStatus }),
      setDataLoading: (isDataLoading) => set({ isDataLoading }),

      updateCoinPrice: (id, newPrice) =>
        set((s) => {
          const coins = s.coins.map((c) => c.id !== id ? c : {
            ...c, price: newPrice, value: newPrice * c.quantity,
            priceChange24h: newPrice - c.price,
            priceChangePct24h: ((newPrice - c.price) / c.price) * 100,
            sparkline: [...c.sparkline.slice(1), newPrice],
          });
          return { coins, portfolio: recomputePortfolio(coins, s.portfolio) };
        }),

      tickAllPrices: () =>
        set((s) => {
          const coins = s.coins.map((c) => {
            const swing = (Math.random() - 0.48) * c.price * 0.004;
            const p = Math.max(0.01, c.price + swing);
            return { ...c, price: p, value: p * c.quantity, priceChange24h: swing, priceChangePct24h: (swing / c.price) * 100, sparkline: [...c.sparkline.slice(1), p] };
          });
          return { coins, portfolio: recomputePortfolio(coins, s.portfolio) };
        }),

      addTransaction: (tx) =>
        set((s) => ({ transactions: [{ ...tx, id: `tx_${Date.now()}` }, ...s.transactions] })),

      openModal: (modal, coin) => set({ activeModal: modal, selectedCoin: coin ?? get().selectedCoin }),
      closeModal: () => set({ activeModal: null, selectedCoin: null }),
      setTimeframe: (tf) => set({ selectedTimeframe: tf }),
      setTxFilter: (filter) => set({ txFilter: filter }),
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      toggleLiveUpdating: () => set((s) => ({ isLiveUpdating: !s.isLiveUpdating })),
    })),
    { name: "AmbWallet" }
  )
);

export const selectTopCoins     = (s: WalletState) => s.coins.slice(0, 4);
export const selectAllCoins     = (s: WalletState) => s.coins;
export const selectPortfolio    = (s: WalletState) => s.portfolio;
export const selectWsStatus     = (s: WalletState) => s.wsStatus;
export const selectIsLoading    = (s: WalletState) => s.isDataLoading;
export const selectTransactions = (s: WalletState) => {
  if (s.txFilter === "all") return s.transactions;
  return s.transactions.filter((t) =>
    s.txFilter === "sent" ? t.type === "sent" || t.type === "swap" : t.type === "received" || t.type === "buy"
  );
};
