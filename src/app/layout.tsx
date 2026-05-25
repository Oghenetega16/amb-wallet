import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// ── DM Sans via next/font (self-hosted, no external request at runtime) ──
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AmbWallet — Crypto Portfolio Tracker",
  description:
    "Professional cryptocurrency portfolio tracker with live prices, charts, and analytics.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${dmSans.variable}`}>
      {/*
        font-sans picks up DM Sans because tailwind.config.ts maps
        fontFamily.sans → ["DM Sans", "sans-serif"]
        The CSS variable --font-dm-sans is also available for inline styles
        if ever needed.
      */}
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
