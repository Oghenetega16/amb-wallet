"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Shield, Bell, Palette, Globe, ChevronRight,
  Eye, EyeOff, Check, Smartphone, Key, LogOut,
} from "lucide-react";
import { Sidebar }   from "@/components/layout/Sidebar";
import { TopNav }    from "@/components/layout/TopNav";
import { TickerBar } from "@/components/layout/TickerBar";
import { staggerContainer, fadeUp, cn } from "@/lib/utils";

// ─── Toggle ────────────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      className="relative w-10 h-5 rounded-full transition-colors duration-300"
      style={{ background: enabled ? "#4f8ef7" : "rgba(255,255,255,0.1)" }}
    >
      <motion.div
        animate={{ x: enabled ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </motion.button>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div variants={fadeUp} className="glass-card p-5">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      <div className="flex flex-col gap-0">{children}</div>
    </motion.div>
  );
}

function SettingRow({
  icon: Icon, label, sub, right, onClick, danger,
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 py-3 border-b last:border-b-0 transition-colors",
        onClick ? "cursor-pointer hover:bg-white/[0.02] -mx-2 px-2 rounded-xl" : ""
      )}
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: danger ? "rgba(247,95,123,0.1)" : "rgba(79,142,247,0.1)" }}>
        <Icon size={15} style={{ color: danger ? "#f75f7b" : "#4f8ef7" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-accent-red" : "text-white"}`}>{label}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "#6b7fa8" }}>{sub}</p>}
      </div>
      {right ?? (onClick && <ChevronRight size={14} style={{ color: "#6b7fa8" }} />)}
    </div>
  );
}

export default function SettingsPage() {
  const [showBalance,   setShowBalance]   = useState(true);
  const [biometrics,    setBiometrics]    = useState(true);
  const [twoFA,         setTwoFA]         = useState(false);
  const [priceAlerts,   setPriceAlerts]   = useState(true);
  const [txAlerts,      setTxAlerts]      = useState(true);
  const [darkMode,      setDarkMode]      = useState(true);
  const [currency,      setCurrency]      = useState("USD");
  const [saved,         setSaved]         = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#060d1f" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 relative z-10 overflow-hidden">
        <TickerBar />
        <TopNav title="Settings" subtitle="Manage your account preferences" />

        <main className="flex-1 overflow-y-auto px-5 py-4">
          <motion.div
            variants={staggerContainer} initial="hidden" animate="show"
            className="max-w-3xl mx-auto flex flex-col gap-4 px-0"
          >

            {/* Profile */}
            <motion.div variants={fadeUp} className="glass-card p-5 flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg,#4f8ef7,#7b5cf0)" }}>
                  OS
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent-green border-2"
                  style={{ borderColor: "#060d1f" }} />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-white">Oghenetega Sukuru</p>
                <p className="text-xs" style={{ color: "#6b7fa8" }}>oghenetegasukuru@ambwallet.com</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1.5"
                  style={{ background: "rgba(79,142,247,0.15)", color: "#4f8ef7" }}>
                  ✦ Premium Plan
                </span>
              </div>
              <button className="btn-secondary text-xs px-4 py-2">Edit Profile</button>
            </motion.div>

            {/* Security */}
            <Section title="Security">
              <SettingRow icon={Eye} label="Hide Balance"
                sub="Mask your balance on dashboard"
                right={<Toggle enabled={!showBalance} onToggle={() => setShowBalance((v) => !v)} />} />
              <SettingRow icon={Smartphone} label="Biometric Login"
                sub="Use Face ID or fingerprint"
                right={<Toggle enabled={biometrics} onToggle={() => setBiometrics((v) => !v)} />} />
              <SettingRow icon={Shield} label="Two-Factor Authentication"
                sub={twoFA ? "Enabled via Authenticator app" : "Not configured"}
                right={<Toggle enabled={twoFA} onToggle={() => setTwoFA((v) => !v)} />} />
              <SettingRow icon={Key} label="Change Password" sub="Last changed 3 months ago" onClick={() => {}} />
            </Section>

            {/* Notifications */}
            <Section title="Notifications">
              <SettingRow icon={Bell} label="Price Alerts"
                sub="Get notified on significant price moves"
                right={<Toggle enabled={priceAlerts} onToggle={() => setPriceAlerts((v) => !v)} />} />
              <SettingRow icon={Bell} label="Transaction Alerts"
                sub="Alerts for incoming and outgoing transactions"
                right={<Toggle enabled={txAlerts} onToggle={() => setTxAlerts((v) => !v)} />} />
            </Section>

            {/* Preferences */}
            <Section title="Preferences">
              <SettingRow icon={Palette} label="Dark Mode"
                sub="Currently active"
                right={<Toggle enabled={darkMode} onToggle={() => setDarkMode((v) => !v)} />} />
              <SettingRow icon={Globe} label="Display Currency"
                sub="Fiat currency for portfolio values"
                right={
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="text-xs rounded-lg px-2 py-1 outline-none border"
                    style={{ background: "#111f3a", borderColor: "rgba(255,255,255,0.1)", color: "#e8edf8" }}>
                    <option>USD</option><option>EUR</option><option>GBP</option><option>NGN</option>
                  </select>
                }
              />
            </Section>

            {/* Danger zone */}
            <Section title="Account">
              <SettingRow icon={LogOut} label="Sign Out" sub="Sign out of your account" onClick={() => {}} danger />
            </Section>

            {/* Save button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              className="btn-primary w-full py-3 text-sm"
            >
              {saved ? (
                <span className="flex items-center gap-2">
                  <Check size={14} /> Settings Saved
                </span>
              ) : "Save Changes"}
            </motion.button>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
