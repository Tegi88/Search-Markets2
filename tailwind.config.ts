import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        border: "var(--border)",
        muted: "var(--muted)",
        up: "#16a34a",
        down: "#dc2626",
        accent: "#2563eb",
      },
    },
  },
  plugins: [],
};

export default config;
