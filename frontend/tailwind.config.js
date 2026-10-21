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
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#ff5c00',
          600: '#ea580c',
        },
        accent: {
          500: '#ff5c00',
          600: '#ea580c',
        },
        dark: {
          900: '#09090b',
          850: '#18181b',
          800: '#27272a',
          750: '#3f3f46',
          700: '#52525b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(34, 197, 94, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
