import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:     ["DM Sans", "sans-serif"],
        "dm-sans":["DM Sans", "sans-serif"],
      },
      colors: {
        navy: {
          50:  "#e8edf8",
          100: "#c5d0eb",
          200: "#9fb0da",
          300: "#7890c9",
          400: "#5a77bb",
          500: "#3d5ea8",
          600: "#2e4d96",
          700: "#1e3a7e",
          800: "#112963",
          900: "#060d1f",
        },
        surface: {
          DEFAULT: "#0d1730",
          2:       "#111f3a",
          3:       "#162448",
          4:       "#1a2a50",
        },
        accent: {
          blue:   "#4f8ef7",
          purple: "#7b5cf0",
          green:  "#22d3a5",
          red:    "#f75f7b",
          yellow: "#f7c948",
          cyan:   "#38bdf8",
        },
        border: {
          DEFAULT: "rgba(255,255,255,0.07)",
          strong:  "rgba(255,255,255,0.13)",
          accent:  "rgba(79,142,247,0.3)",
        },
      },
      backgroundImage: {
        "gradient-navy":  "linear-gradient(135deg, #060d1f 0%, #0d1730 100%)",
        "gradient-card":  "linear-gradient(135deg, rgba(79,142,247,0.06) 0%, transparent 60%)",
        "gradient-blue":  "linear-gradient(135deg, #4f8ef7, #7b5cf0)",
        "gradient-green": "linear-gradient(135deg, #22d3a5, #38bdf8)",
      },
      boxShadow: {
        "blue-glow":  "0 4px 20px rgba(79,142,247,0.4)",
        "green-glow": "0 4px 20px rgba(34,211,165,0.35)",
        card:         "0 2px 24px rgba(0,0,0,0.3)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        ticker:       "ticker 30s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
