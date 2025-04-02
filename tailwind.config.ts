import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0070f3',
        secondary: '#1d4ed8',
        destructive: '#ef4444',
        muted: '#f5f5f5',
        accent: '#eef2ff',
        border: '#e5e7eb',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config 