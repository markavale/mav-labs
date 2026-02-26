export const brand = {
  colors: {
    cyan: '#22d3ee',
    purple: '#a855f7',
    sky: '#0ea5e9',
    darkBg: '#0D1117',
    darkCard: '#161B22',
    darkBorder: '#30363D',
    textPrimary: '#F0F6FC',
    textSecondary: '#8B949E',
    textMuted: '#6E7681',
    success: '#3FB950',
    warning: '#D29922',
    error: '#F85149',
    blocked: '#F85149',
    inProgress: '#A855F7',
    todo: '#8B949E',
    done: '#3FB950',
  },
  fonts: {
    sans: "'Space Grotesk', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
} as const;

export const paraColors = {
  projects: '#22d3ee',
  areas: '#a855f7',
  resources: '#0ea5e9',
  archives: '#6E7681',
} as const;

export type ParaCategory = keyof typeof paraColors;
