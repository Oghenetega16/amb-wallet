"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, Settings, Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { useWalletStore } from "@/store/walletStore";
import { WsStatusBadge } from "@/components/ui/WsStatusBadge";
import { cn } from "@/lib/utils";

interface TopNavProps {
  title:     string;
  subtitle?: string;
}

export function TopNav({ title, subtitle }: TopNavProps) {
  const { data: session }                     = useSession();
  const toggleSidebar                         = useWalletStore((s) => s.toggleSidebar);
  const [searchFocused, setSearchFocused]     = useState(false);
  const [searchQuery,   setSearchQuery]       = useState("");
  const [showNotifs,    setShowNotifs]        = useState(false);
  const [showSearch,    setShowSearch]        = useState(false);

  const notifications = [
    { id: 1, text: "BTC price up +2.1% in the last hour",   time: "2m ago",  dot: "#22d3a5" },
    { id: 2, text: "Transaction confirmed: 0.56 ETH sent",  time: "14m ago", dot: "#4f8ef7" },
    { id: 3, text: "Portfolio reached new high: $5,610",    time: "1h ago",  dot: "#f7c948" },
  ];

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-14 shrink-0 gap-3"
      style={{ background: "rgba(6,13,31,0.88)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — always visible, opens mobile drawer; on desktop collapses sidebar */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={toggleSidebar}
          className="btn-icon shrink-0"
        >
          <Menu size={16} />
        </motion.button>

        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-white leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] mt-0.5 truncate hidden sm:block" style={{ color: "#6b7fa8" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-2 shrink-0">

        {/* Search — full on md+, icon-only on mobile */}
        <div className="hidden md:block">
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
              style={{ fontSize: 12 }}
            />
          </motion.div>
        </div>

        {/* Search icon — mobile only */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSearch((v) => !v)}
          className="btn-icon md:hidden"
        >
          <Search size={15} />
        </motion.button>

        {/* WS status — hidden on smallest screens */}
        <div className="hidden sm:block">
          <WsStatusBadge />
        </div>

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
                className="absolute right-0 top-10 w-64 sm:w-72 rounded-2xl border z-50 overflow-hidden"
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

        {/* Settings — hidden on mobile */}
        <motion.button whileTap={{ scale: 0.9 }} className="btn-icon hidden sm:flex">
          <Settings size={15} />
        </motion.button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer shrink-0"
          style={{ background: "linear-gradient(135deg,#4f8ef7,#7b5cf0)" }}
        >
          {session?.user?.name
            ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
            : "OS"}
        </div>
      </div>

      {/* Mobile search bar — slides down */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-14 left-0 right-0 px-4 py-2 md:hidden z-20"
            style={{ background: "rgba(6,13,31,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-accent-blue"
              style={{ background: "#111f3a" }}>
              <Search size={13} style={{ color: "#3d5070" }} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onBlur={() => setShowSearch(false)}
                placeholder="Search assets..."
                className="bg-transparent outline-none w-full text-white text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
