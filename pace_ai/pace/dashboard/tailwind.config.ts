import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: '#22d3ee',
          purple: '#a855f7',
          sky: '#0ea5e9',
        },
        dark: {
          bg: '#0D1117',
          card: '#161B22',
          border: '#30363D',
        },
        text: {
          primary: '#F0F6FC',
          secondary: '#8B949E',
          muted: '#6E7681',
        },
        status: {
          success: '#3FB950',
          warning: '#D29922',
          error: '#F85149',
          blocked: '#F85149',
          inProgress: '#A855F7',
          todo: '#8B949E',
          done: '#3FB950',
        },
        para: {
          projects: '#22d3ee',
          areas: '#a855f7',
          resources: '#0ea5e9',
          archives: '#6E7681',
        },
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pace-breathe': 'pace-breathe 4s ease-in-out infinite',
        'pace-glow': 'pace-glow-pulse 2s ease-in-out infinite',
        'pace-spin': 'pace-spin-particles 3s linear infinite',
        'pace-shake': 'pace-shake 0.6s ease-in-out infinite',
      },
      keyframes: {
        'pace-breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        'pace-glow-pulse': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.12)' },
        },
        'pace-spin-particles': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'pace-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-3px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(3px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
