"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { LogOut, Settings, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [signing, setSigning] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div className="w-8 h-8 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="flex flex-col gap-1">
          <div className="w-20 h-2.5 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="w-14 h-2 rounded animate-pulse"   style={{ background: "rgba(255,255,255,0.05)" }} />
        </div>
      </div>
    );
  }

  const user    = session?.user;
  const initials = user?.name ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "?";
  const plan    = (user as any)?.plan ?? "free";

  async function handleSignOut() {
    setSigning(true);
    await signOut({ callbackUrl: "/auth/signin" });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-xl transition-colors hover:bg-white/[0.05]"
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg,#4f8ef7,#7b5cf0)" }}>
          {user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={initials} className="w-full h-full rounded-full object-cover" />
          ) : initials}
        </div>

        <div className="flex flex-col items-start min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate leading-none">{user?.name ?? "User"}</p>
          <p className="text-[10px] mt-0.5 capitalize" style={{ color: "#3d5070" }}>{plan} plan</p>
        </div>

        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronUp size={12} style={{ color: "#3d5070" }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full mb-2 left-0 right-0 rounded-xl border overflow-hidden z-50"
            style={{ background: "#111f3a", borderColor: "rgba(255,255,255,0.1)" }}
            onMouseLeave={() => setOpen(false)}
          >
            {/* User info header */}
            <div className="px-3 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <p className="text-xs font-semibold text-white">{user?.name}</p>
              <p className="text-[10px]" style={{ color: "#6b7fa8" }}>{user?.email}</p>
            </div>

            {/* Plan badge */}
            <div className="px-3 py-2 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: plan === "premium" ? "rgba(247,201,72,0.15)" : "rgba(79,142,247,0.1)",
                  color: plan === "premium" ? "#f7c948"                : "#4f8ef7",
                }}>
                {plan === "premium" ? "✦ Premium" : "Free Plan"}
              </span>
            </div>

            {/* Actions */}
            <Link href="/settings"
              className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium hover:bg-white/[0.05] transition-colors"
              style={{ color: "#e8edf8" }}
              onClick={() => setOpen(false)}>
              <Settings size={12} style={{ color: "#6b7fa8" }} /> Settings
            </Link>

            <button
              onClick={handleSignOut}
              disabled={signing}
              className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium w-full hover:bg-white/[0.05] transition-colors text-left disabled:opacity-60"
              style={{ color: "#f75f7b" }}
            >
              {signing ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
