"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWalletStore } from "@/store/walletStore";
import { WsStatusBadge } from "@/components/ui/WsStatusBadge";
import { cn } from "@/lib/utils";

interface TopNavProps {
  title:     string;
  subtitle?: string;
}

export function TopNav({ title, subtitle }: TopNavProps) {
  const { data: session } = useSession();
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [showNotifs,    setShowNotifs]    = useState(false);

  const notifications = [
    { id: 1, text: "BTC price up +2.1% in the last hour",   time: "2m ago",  dot: "#22d3a5" },
    { id: 2, text: "Transaction confirmed: 0.56 ETH sent",  time: "14m ago", dot: "#4f8ef7" },
    { id: 3, text: "Portfolio reached new high: $5,610",    time: "1h ago",  dot: "#f7c948" },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 shrink-0"
      style={{ background: "rgba(6,13,31,0.88)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Left: page title */}
      <div>
        <h1 className="text-sm font-semibold text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "#6b7fa8" }}>{subtitle}</p>}
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <motion.div
          animate={{ width: searchFocused ? 200 : 148 }}
          transition={{ duration: 0.22 }}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm transition-colors duration-200",
            searchFocused ? "border-accent-blue" : "border-white/[0.08]"
          )}
          style={{ background: "#111f3a" }}
        >
          <Search size={13} className="shrink-0" style={{ color: "#3d5070" }} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search assets..."
            className="bg-transparent outline-none w-full text-white"
            style={{ fontSize: 12, color: "#e8edf8" }}
          />
        </motion.div>

        {/* WS status badge */}
        <WsStatusBadge />

        {/* Notifications */}
        <div className="relative">
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => setShowNotifs((v) => !v)}
            className="btn-icon relative">
            <Bell size={15} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-blue" />
          </motion.button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-10 w-72 rounded-2xl border z-50 overflow-hidden"
                style={{ background: "#111f3a", borderColor: "rgba(255,255,255,0.1)" }}
                onMouseLeave={() => setShowNotifs(false)}
              >
                <div className="px-4 pt-3 pb-2 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
                  <p className="text-xs font-semibold text-white">Notifications</p>
                </div>
                {notifications.map((n) => (
                  <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: n.dot }} />
                    <div>
                      <p className="text-xs text-white leading-snug">{n.text}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "#3d5070" }}>{n.time}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings */}
        <motion.button whileTap={{ scale: 0.9 }} className="btn-icon">
          <Settings size={15} />
        </motion.button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg,#4f8ef7,#7b5cf0)" }}>
          JD
        </div>
      </div>
    </header>
  );
}
