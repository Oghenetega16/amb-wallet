"use client";
import { UserMenu } from "@/components/ui/UserMenu";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Coins, CreditCard, HelpCircle,
  Settings, Bell, TrendingUp, Wallet, ChevronLeft, Briefcase,
} from "lucide-react";
import { useWalletStore } from "@/store/walletStore";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard",  href: "/",           icon: LayoutDashboard },
  { label: "Currencies", href: "/currencies", icon: Coins },
  { label: "Payments",   href: "/payments",   icon: CreditCard },
  { label: "Analytics",  href: "/analytics",  icon: TrendingUp },
  { label: "Portfolio",  href: "/portfolio",  icon: Briefcase },
  { label: "Help",       href: "/help",       icon: HelpCircle },
];

const bottomItems = [
  { label: "Settings",      href: "/settings",     icon: Settings },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function Sidebar() {
  const pathname        = usePathname();
  const isSidebarOpen   = useWalletStore((s) => s.isSidebarOpen);
  const toggleSidebar   = useWalletStore((s) => s.toggleSidebar);

  return (
    <motion.aside
      animate={{ width: isSidebarOpen ? 220 : 68 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative flex flex-col h-screen shrink-0 z-40 overflow-hidden"
      style={{ background: "#0a1020", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg,#4f8ef7,#7b5cf0)" }}>
          <Wallet size={18} className="text-white" />
        </div>
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <span className="text-base font-bold text-white whitespace-nowrap">
                Amb<span className="text-accent-blue">Wallet</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        aria-label="Toggle button"
        onClick={toggleSidebar}
        className={cn(
          "absolute top-[52px] -right-3 w-6 h-6 rounded-full border flex items-center justify-center",
          "bg-[#111f3a] border-white/10 text-[#6b7fa8] hover:text-white hover:border-accent-blue",
          "transition-all duration-200 z-50"
        )}
      >
        <motion.div animate={{ rotate: isSidebarOpen ? 0 : 180 }} transition={{ duration: 0.3 }}>
          <ChevronLeft size={12} />
        </motion.div>
      </button>

      {/* Nav section label */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 pt-4 pb-1 text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "#3d5070" }}
          >
            Menu
          </motion.p>
        )}
      </AnimatePresence>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 px-3 flex-1 mt-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
                "transition-all duration-200 group overflow-hidden",
                active
                  ? "text-accent-blue"
                  : "text-[#6b7fa8] hover:text-white hover:bg-white/[0.05]"
              )}
              style={active ? { background: "rgba(79,142,247,0.1)" } : {}}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-accent-blue"
                  transition={{ duration: 0.25 }}
                />
              )}
              <Icon size={18} className="shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18 }}
                    className="whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="flex flex-col gap-1 px-3 pb-4">
        {bottomItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-[#6b7fa8] hover:text-white hover:bg-white/[0.05] transition-all duration-200"
          >
            <Icon size={18} className="shrink-0" />
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.18 }}
                  className="whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        ))}

        {/* User menu — real session */}
        <div className="pt-3 mt-1 border-t border-white/[0.06]">
          {isSidebarOpen ? <UserMenu /> : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg,#4f8ef7,#7b5cf0)" }}>OS</div>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
