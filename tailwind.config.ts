import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // BKLYN-THREADS brand palette
        obsidian: "#0D0D0D", // deep pitch-black base
        cardinal: "#C41E3A", // Cardinals red accent
        amber: "#F5C518", // warm neon yellow for retro TV text
        "silver-gray": "#A8A9AD", // metallic trim
        "bone-white": "#F4F1EA", // off-white body text
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-monospace", "monospace"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        crt: "inset 0 0 60px rgba(0,0,0,0.85), 0 0 30px rgba(196,30,58,0.25)",
        "hanger-lift": "0 18px 40px -12px rgba(0,0,0,0.8)",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "crt-flicker": {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.7" },
          "94%": { opacity: "1" },
          "98%": { opacity: "0.85" },
        },
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        scanline: "scanline 6s linear infinite",
        "crt-flicker": "crt-flicker 4s infinite",
        ticker: "ticker 22s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;