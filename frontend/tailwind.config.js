/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#f0ece2',
        bgCard: '#ffffff',
        bgSubtle: '#f7f4ed',
        borderMain: '#e2ded4',
        textMain: '#1a2530',
        textMuted: '#576574',
        brandPrimary: '#24527a',
        brandSecondary: '#247291',
        brandCyan: '#1d7090',
        brandAccent: '#3b82f6',
      }
    },
  },
  plugins: [],
}
