const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', ...fontFamily.sans],
        display: ['"Syne"', ...fontFamily.sans],
      },
      boxShadow: {
        'glow-green': '0 0 12px var(--accent-green)',
        'glow-amber': '0 0 12px var(--accent-amber)',
        'glow-red': '0 0 12px var(--accent-red)',
      },
      animation: {
        scanline: 'scanline 3s ease-in-out infinite',
      },
      keyframes: {
        scanline: {
          '0%, 100%': { transform: 'translateY(-10%)', opacity: 0.2 },
          '50%': { transform: 'translateY(110%)', opacity: 0.8 },
        }
      }
    },
  },
  plugins: [],
}
