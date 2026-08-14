/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgMain: '#F8F9FE',
        bgSubtle: '#F3F0FF',
        bgPure: '#FFFFFF',
        textPrimary: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#94A3B8',
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
        },
        accentSaffron: '#F59E0B',
        accentGreen: '#10B981',
        accentCrimson: '#E11D48',
        accentCyan: '#06B6D4',
        accentPurple: '#8B5CF6',
        surfaceBorder: 'rgba(124, 58, 237, 0.10)',
        surfaceBorderHover: 'rgba(124, 58, 237, 0.25)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glass-sm': '0 4px 16px 0 rgba(109, 40, 217, 0.04)',
        'glass': '0 12px 36px 0 rgba(109, 40, 217, 0.07)',
        'glass-lg': '0 24px 64px 0 rgba(109, 40, 217, 0.11)',
        'glass-hover': '0 20px 45px -5px rgba(109, 40, 217, 0.16)',
        'purple-glow': '0 0 30px rgba(124, 58, 237, 0.22)',
        'card-elevated': '0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 0 0 1px rgba(124, 58, 237, 0.08)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      }
    },
  },
  plugins: [],
}
