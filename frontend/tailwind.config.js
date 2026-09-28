/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a5f6',
          500: '#0e86d4',
          600: '#0066b2',
          700: '#005291',
          800: '#004377',
          900: '#00335c',
          950: '#001e38',
        },
        medical: {
          teal: '#0d9488',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          surface: '#f8fafc',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'premium': '0 10px 25px -5px rgba(14, 134, 212, 0.08), 0 8px 10px -6px rgba(14, 134, 212, 0.04)',
      }
    },
  },
  plugins: [],
}
