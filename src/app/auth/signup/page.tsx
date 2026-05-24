"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock, User } from "lucide-react";
import { staggerContainer, fadeUp } from "@/lib/utils";

export default function SignUpPage() {
  const router = useRouter();
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // Password strength
  const strength =
    password.length === 0 ? 0 :
    password.length < 6   ? 1 :
    password.length < 10 && !/[^a-zA-Z0-9]/.test(password) ? 2 :
    password.length >= 10 && /[^a-zA-Z0-9]/.test(password) ? 4 : 3;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#f75f7b", "#f7c948", "#4f8ef7", "#22d3a5"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      // Register via API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Registration failed."); return; }

      // Auto sign-in after registration
      const signInRes = await signIn("credentials", {
        email, password, redirect: false,
      });

      if (signInRes?.error) {
        router.push("/auth/signin");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5"
    >
      <motion.div variants={fadeUp} className="text-center">
        <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-sm" style={{ color: "#6b7fa8" }}>Start tracking your crypto portfolio today</p>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="rounded-3xl p-6 flex flex-col gap-4"
        style={{ background: "#0d1730", border: "1px solid rgba(255,255,255,0.09)" }}
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
            style={{ background: "rgba(247,95,123,0.1)", border: "1px solid rgba(247,95,123,0.25)", color: "#f75f7b" }}
          >
            <AlertCircle size={13} /> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Full Name</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#3d5070" }} />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                required placeholder="Oghenetega Sukuru" className="field-input pl-10" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#3d5070" }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="you@example.com" className="field-input pl-10" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#3d5070" }} />
              <input type={showPass ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)} required
                placeholder="Min. 8 characters" className="field-input pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "#6b7fa8" }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex gap-1 flex-1">
                  {[1,2,3,4].map((s) => (
                    <div key={s} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ background: s <= strength ? strengthColor : "rgba(255,255,255,0.08)" }} />
                  ))}
                </div>
                <span className="text-[10px] font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#3d5070" }} />
              <input type={showPass ? "text" : "password"} value={confirm}
                onChange={(e) => setConfirm(e.target.value)} required
                placeholder="Repeat password" className="field-input pl-10"
                style={{ borderColor: confirm && confirm !== password ? "#f75f7b" : undefined }} />
            </div>
          </div>

          {/* ToS */}
          <p className="text-[11px]" style={{ color: "#3d5070" }}>
            By signing up you agree to our{" "}
            <span className="underline cursor-pointer" style={{ color: "#4f8ef7" }}>Terms</span> and{" "}
            <span className="underline cursor-pointer" style={{ color: "#4f8ef7" }}>Privacy Policy</span>.
          </p>

          <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="btn-primary w-full py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-1">
            {loading
              ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Creating account...</span>
              : "Create Account"}
          </motion.button>
        </form>
      </motion.div>

      <motion.p variants={fadeUp} className="text-center text-sm" style={{ color: "#6b7fa8" }}>
        Already have an account?{" "}
        <Link href="/auth/signin" className="font-semibold hover:underline" style={{ color: "#4f8ef7" }}>Sign in</Link>
      </motion.p>
    </motion.div>
  );
}
