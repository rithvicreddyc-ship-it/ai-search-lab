/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lab: {
          bg: '#05070f',
          void: '#03050a',
          card: '#0b101d',
          panel: '#101728',
          hover: '#162035',
          border: '#1c263d',
          borderLight: '#2a3754',
          muted: '#64748b',
          accent: '#6366f1',
          accentHover: '#4f46e5',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.4)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.45)',
        'glow-violet': '0 0 22px -3px rgba(139, 92, 246, 0.4)',
        'glow-amber': '0 0 20px -3px rgba(245, 158, 11, 0.4)',
        'glow-rose': '0 0 20px -3px rgba(244, 63, 94, 0.45)',
        'glow-indigo': '0 0 22px -3px rgba(99, 102, 241, 0.45)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'glass-button': '0 4px 14px 0 rgba(0, 0, 0, 0.35), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

