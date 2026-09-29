import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0a0e20',
        'navy-dark': '#050813',
        cyan: '#00d4ff',
        blue: '#3b82f6',
        'blue-light': '#60a5fa',
      }
    }
  },
  plugins: [],
} satisfies Config