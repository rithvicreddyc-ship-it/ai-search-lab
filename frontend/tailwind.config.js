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
          bg: '#f8fafc',
          void: '#f1f5f9',
          card: '#ffffff',
          panel: '#ffffff',
          hover: '#f8fafc',
          border: '#e2e8f0',
          borderLight: '#cbd5e1',
          muted: '#64748b',
          accent: '#4f46e5',
          accentHover: '#4338ca',
        },
      },
      boxShadow: {
        'glow-cyan': '0 4px 20px -2px rgba(6, 182, 212, 0.25)',
        'glow-emerald': '0 4px 20px -2px rgba(16, 185, 129, 0.25)',
        'glow-violet': '0 4px 20px -2px rgba(139, 92, 246, 0.25)',
        'glow-amber': '0 4px 20px -2px rgba(245, 158, 11, 0.25)',
        'glow-rose': '0 4px 20px -2px rgba(244, 63, 94, 0.25)',
        'glow-indigo': '0 4px 22px -2px rgba(79, 70, 229, 0.28)',
        'glass-card': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'glass-button': '0 2px 6px 0 rgba(0, 0, 0, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

