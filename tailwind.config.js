/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        petroleo: 'var(--color-accent)',
        esmeralda: '#10B981',
        coral: '#EF4444',
        ambar: '#F59E0B',
        indigo: '#6366F1',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.08), 0 1px 3px 0 rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
