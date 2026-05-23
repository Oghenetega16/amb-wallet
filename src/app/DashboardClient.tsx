"use client";

import { motion } from "framer-motion";
import { Sidebar }             from "@/components/layout/Sidebar";
import { TopNav }              from "@/components/layout/TopNav";
import { TickerBar }           from "@/components/layout/TickerBar";
import { GlobalMarketBar }     from "@/components/dashboard/GlobalMarketBar";
import { OverallCard }         from "@/components/dashboard/OverallCard";
import { CoinsCard }           from "@/components/dashboard/CoinsCard";
import { HistoryCard }         from "@/components/dashboard/HistoryCard";
import { StatsChart }          from "@/components/dashboard/StatsChart";
import { PortfolioAllocation } from "@/components/dashboard/PortfolioAllocation";
import { MarketPulse }         from "@/components/dashboard/MarketPulse";
import { AIInsights }          from "@/components/dashboard/AIInsights";
import { SendModal }           from "@/components/modals/SendModal";
import { ReceiveModal }        from "@/components/modals/ReceiveModal";
import { CoinDetailModal }     from "@/components/modals/CoinDetailModal";
import { useSession }          from "next-auth/react";

// Week 2: real-data hooks
import { useCoins, usePrefetchCoins } from "@/hooks/useCoins";
import { useBinanceWebSocket }        from "@/hooks/useBinanceWebSocket";
import { staggerContainer }           from "@/lib/utils";

export function DashboardClient() {
  const { data: session } = useSession();

  // Week 2: real data
  usePrefetchCoins();    // warm TanStack cache immediately
  useCoins();            // fetch + sync Zustand on mount
  useBinanceWebSocket(); // open Binance WS → push ticks into store

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060d1f" }}>

      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute w-[700px] h-[700px] rounded-full -top-60 -left-40"
          style={{ background: "radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%)" }} />
        <div className="absolute w-[600px] h-[600px] rounded-full -bottom-40 -right-40"
          style={{ background: "radial-gradient(circle, rgba(123,92,240,0.07) 0%, transparent 70%)" }} />
      </div>

      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <GlobalMarketBar />
        <TickerBar />

        <TopNav
          title="Dashboard"
          subtitle={`Welcome back, ${session?.user?.name?.split(" ")?.[0] ?? "John"} 👋`}
        />

        <main className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-[1400px] mx-auto flex flex-col gap-4"
          >
            {/* Row 1: Overall | Coins | History */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "260px 1fr 1fr" }}>
              <OverallCard />
              <CoinsCard />
              <HistoryCard />
            </div>

            {/* Row 2: Stats | Allocation | Pulse */}
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 220px 200px" }}>
              <StatsChart />
              <PortfolioAllocation />
              <MarketPulse />
            </div>

            {/* Row 3: AI Insights — full width */}
            <AIInsights />
          </motion.div>
        </main>
      </div>

      <SendModal />
      <ReceiveModal />
      <CoinDetailModal />
    </div>
  );
}
