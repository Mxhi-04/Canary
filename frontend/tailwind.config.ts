import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "var(--canvas)",
          deep: "var(--canvas-deep)",
        },
        panel: {
          DEFAULT: "var(--panel)",
          raised: "var(--panel-raised)",
          inset: "var(--panel-inset)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        canary: {
          text: "var(--text)",
          "text-2": "var(--text-2)",
          "text-3": "var(--text-3)",
          amber: "var(--amber)",
          "amber-glow": "var(--amber-glow)",
        },
        tier: {
          watch: "var(--tier-watch)",
          alert: "var(--tier-alert)",
          action: "var(--tier-action)",
          "watch-text": "var(--tier-watch-text)",
          "alert-text": "var(--tier-alert-text)",
          "action-text": "var(--tier-action-text)",
        },
        status: {
          ok: "var(--ok)",
          stale: "var(--stale)",
          missing: "var(--missing)",
          info: "var(--info)",
        },
        prov: {
          real: "var(--prov-real)",
          sim: "var(--prov-sim)",
          illus: "var(--prov-illus)",
        },
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        panel: "14px",
        control: "8px",
        badge: "6px",
      },
      boxShadow: {
        panel: "0 12px 32px rgba(0, 0, 0, 0.35)",
        highlight: "inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        "amber-glow": "0 0 20px rgba(242, 163, 58, 0.35)",
        "action-glow": "0 0 20px rgba(229, 72, 61, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
