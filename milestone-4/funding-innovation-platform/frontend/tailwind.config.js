/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1220",
          900: "#101A2B",
          800: "#182640",
          700: "#223452",
        },
        surface: {
          50: "#F6F8F7",
          100: "#EEF2F0",
          200: "#E2E8E4",
        },
        signal: {
          emerald: "#0E8F6B",
          emeraldDark: "#0A6B50",
          amber: "#C9962C",
          amberSoft: "#F1E4C6",
          rose: "#B4453A",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(16, 26, 43, 0.06), 0 8px 24px -12px rgba(16, 26, 43, 0.18)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
