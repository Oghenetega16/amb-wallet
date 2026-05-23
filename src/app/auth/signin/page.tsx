"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, AlertCircle, Mail, Lock } from "lucide-react";
import { staggerContainer, fadeUp } from "@/lib/utils";

// ─── Google icon SVG ───────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  OAuthSignin:       "Could not sign in with Google. Try again.",
  OAuthCallback:     "OAuth callback error. Please retry.",
  Default:           "Something went wrong. Please try again.",
};

// Extracted the core logic into its own component
function SignInContent() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const errorKey = params.get("error") ?? "";

  const [email,       setEmail]       = useState("oghenetegasukuru@ambwallet.com");
  const [password,    setPassword]    = useState("password123");
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [googleLoad,  setGoogleLoad]  = useState(false);
  const [formError,   setFormError]   = useState("");

  const urlError = ERROR_MESSAGES[errorKey] ?? (errorKey ? ERROR_MESSAGES.Default : "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email, password, redirect: false, callbackUrl,
      });
      if (res?.error) {
        setFormError(ERROR_MESSAGES.CredentialsSignin);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setFormError(ERROR_MESSAGES.Default);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoad(true);
    await signIn("google", { callbackUrl });
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5"
    >
      {/* Heading */}
      <motion.div variants={fadeUp} className="text-center">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm" style={{ color: "#6b7fa8" }}>Sign in to your AmbWallet account</p>
      </motion.div>

      {/* Card */}
      <motion.div
        variants={fadeUp}
        className="rounded-3xl p-6 flex flex-col gap-4"
        style={{ background: "#0d1730", border: "1px solid rgba(255,255,255,0.09)" }}
      >
        {/* URL error */}
        {(urlError || formError) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
            style={{ background: "rgba(247,95,123,0.1)", border: "1px solid rgba(247,95,123,0.25)", color: "#f75f7b" }}
          >
            <AlertCircle size={13} />
            {formError || urlError}
          </motion.div>
        )}

        {/* Google */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogle}
          disabled={googleLoad}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          {googleLoad ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <span className="text-xs" style={{ color: "#3d5070" }}>or continue with email</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Email</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#3d5070" }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="field-input pl-10"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium uppercase tracking-wide" style={{ color: "#6b7fa8" }}>Password</label>
              <Link href="/auth/forgot" className="text-xs hover:underline" style={{ color: "#4f8ef7" }}>Forgot?</Link>
            </div>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#3d5070" }} />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="field-input pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPass((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: "#6b7fa8" }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Demo hint */}
          <p className="text-[11px] text-center px-2 py-1.5 rounded-lg" style={{ background: "rgba(79,142,247,0.06)", color: "#6b7fa8" }}>
            Demo credentials are pre-filled ↑
          </p>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            disabled={loading}
            className="btn-primary w-full py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed mt-1"
          >
            {loading ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Signing in...</span>
            ) : "Sign In"}
          </motion.button>
        </form>
      </motion.div>

      {/* Sign up link */}
      <motion.p variants={fadeUp} className="text-center text-sm" style={{ color: "#6b7fa8" }}>
        Don't have an account?{" "}
        <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: "#4f8ef7" }}>
          Create one free
        </Link>
      </motion.p>
    </motion.div>
  );
}

// Wrap the component using useSearchParams in a Suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="animate-spin text-white" /></div>}>
      <SignInContent />
    </Suspense>
  );
}