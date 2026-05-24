"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, TrendingUp, ArrowUpRight, ArrowDownLeft, AlertTriangle, Check, Trash2 } from "lucide-react";
import { Sidebar }   from "@/components/layout/Sidebar";
import { TopNav }    from "@/components/layout/TopNav";
import { TickerBar } from "@/components/layout/TickerBar";
import { staggerContainer, fadeUp } from "@/lib/utils";

type Notif = {
  id: string; type: "price" | "tx" | "alert" | "system";
  title: string; body: string; time: string; read: boolean;
};

const INITIAL: Notif[] = [
  { id: "n1", type: "price",  title: "BTC Price Alert",          body: "Bitcoin is up +4.2% in the last hour, now trading at $68,204.",    time: "2m ago",   read: false },
  { id: "n2", type: "tx",    title: "Transaction Confirmed",      body: "Your transfer of 0.56 ETH ($2,000) has been confirmed on-chain.",  time: "14m ago",  read: false },
  { id: "n3", type: "price", title: "Portfolio New High",         body: "Your portfolio has reached a new all-time high of $5,610.",         time: "1h ago",   read: false },
  { id: "n4", type: "tx",    title: "Received 0.015 BTC",         body: "+$1,000 received from address 0x3ab1...f882.",                     time: "3h ago",   read: true  },
  { id: "n5", type: "alert", title: "LTC Dropped -7.1%",          body: "Litecoin dropped significantly in the last 24 hours.",             time: "5h ago",   read: true  },
  { id: "n6", type: "system", title: "Security Tip",              body: "Enable two-factor authentication to secure your account.",         time: "1d ago",   read: true  },
  { id: "n7", type: "price", title: "SOL Rally",                  body: "Solana is up +3.4% — one of your top performers today.",           time: "1d ago",   read: true  },
];

const ICON_MAP = {
  price:  { icon: TrendingUp,     color: "#22d3a5", bg: "rgba(34,211,165,0.1)" },
  tx:     { icon: ArrowDownLeft,  color: "#4f8ef7", bg: "rgba(79,142,247,0.1)" },
  alert:  { icon: AlertTriangle,  color: "#f7c948", bg: "rgba(247,201,72,0.1)" },
  system: { icon: Bell,           color: "#7b5cf0", bg: "rgba(123,92,240,0.1)" },
};

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);
  const unread = notifs.filter((n) => !n.read).length;

  const markAll  = () => setNotifs((ns) => ns.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs((ns) => ns.map((n) => n.id === id ? { ...n, read: true } : n));
  const remove   = (id: string) => setNotifs((ns) => ns.filter((n) => n.id !== id));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060d1f" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <TickerBar />
        <TopNav title="Notifications" subtitle={`${unread} unread`} />

        <main className="flex-1 overflow-y-auto px-5 py-4">
          <div className="max-w-2xl mx-auto px-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium" style={{ color: "#6b7fa8" }}>
                {notifs.length} notifications
              </span>
              {unread > 0 && (
                <button onClick={markAll}
                  className="flex items-center gap-1.5 text-xs font-medium text-accent-blue hover:underline">
                  <Check size={12} /> Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-2">
              <AnimatePresence>
                {notifs.map((n) => {
                  const { icon: Icon, color, bg } = ICON_MAP[n.type];
                  return (
                    <motion.div
                      key={n.id}
                      variants={fadeUp}
                      layout
                      exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                      className="glass-card px-4 py-3 flex items-start gap-3 group"
                      style={{ opacity: n.read ? 0.65 : 1 }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                        <Icon size={15} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{n.title}</p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shrink-0" />
                          )}
                        </div>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#6b7fa8" }}>{n.body}</p>
                        <p className="text-[10px] mt-1" style={{ color: "#3d5070" }}>{n.time}</p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.read && (
                          <button onClick={() => markRead(n.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                            title="Mark as read">
                            <Check size={12} style={{ color: "#22d3a5" }} />
                          </button>
                        )}
                        <button onClick={() => remove(n.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                          title="Remove">
                          <Trash2 size={12} style={{ color: "#f75f7b" }} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {notifs.length === 0 && (
                <motion.div variants={fadeUp} className="text-center py-16">
                  <Bell size={40} className="mx-auto mb-3" style={{ color: "#3d5070" }} />
                  <p className="text-sm" style={{ color: "#6b7fa8" }}>You're all caught up!</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
