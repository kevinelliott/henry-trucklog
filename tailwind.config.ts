import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5ff',
          300: '#a5b8ff',
          400: '#8196ff',
          500: '#6474ff',
          600: '#4f54f5',
          700: '#4240e0',
          800: '#3635b5',
          900: '#30318f',
          950: '#1e1f5c',
        }
      }
    },
  },
  plugins: [],
}
export default config
