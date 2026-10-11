/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Dark-Blue 60%
        'hms-navy': {
          DEFAULT: '#0a192f',
          50: '#f0f4f9',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#1b3353',
          900: '#0f2441',
          950: '#0a192f',
        },
        // Forest Dark-Green 30%
        'hms-emerald': {
          DEFAULT: '#064e3b',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        brand: {
          50: '#f0fdf7',
          100: '#dcfce9',
          200: '#bbf7d2',
          300: '#86efae',
          400: '#4ade80',
          500: '#059669',
          600: '#047857',
          700: '#064e3b',
          800: '#0f2441',
          900: '#0a192f',
          950: '#06101e',
        },
        medical: {
          teal: '#047857',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          surface: '#ffffff',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(10, 25, 47, 0.05), 0 4px 6px -2px rgba(10, 25, 47, 0.02)',
        'premium': '0 10px 25px -5px rgba(6, 78, 59, 0.12), 0 8px 10px -6px rgba(10, 25, 47, 0.06)',
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-blue': '0 0 20px -3px rgba(15, 36, 65, 0.45)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-up': 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
