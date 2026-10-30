/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          primary: "#2563EB",
          primaryHover: "#1D4ED8",
          emerald: "#059669",
          emeraldLight: "#ECFDF5",
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
          borderStrong: "#CBD5E1",
          textPrimary: "#0F172A",
          textSecondary: "#475569",
          textMuted: "#94A3B8"
        }
      },
      fontFamily: {
        sans: ['"Roboto"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Roboto"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
