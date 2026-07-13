/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#bddbfe',
          300: '#90c2fd',
          400: '#5ca2fc',
          500: '#1e96fc', // Vibrant Sky Blue
          600: '#11296b', // Deep Navy Blue
          700: '#0e2054',
          800: '#0b183f',
          900: '#07102b',
        },
        accent: {
          50: '#fffef0',
          100: '#fffcd1',
          200: '#fff7a2',
          300: '#ffeb73',
          400: '#ffdb57', // Warm Yellow
          500: '#ffcb05', // Gold
          600: '#dcb000',
          700: '#b38e00',
          800: '#8a6d00',
          900: '#614d00',
        },
        indigo: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#bddbfe',
          300: '#90c2fd',
          400: '#5ca2fc',
          500: '#1e96fc',
          600: '#11296b',
          700: '#0e2054',
          800: '#0b183f',
          900: '#07102b',
        },
        purple: {
          50: '#fffef0',
          100: '#fffcd1',
          200: '#fff7a2',
          300: '#ffeb73',
          400: '#ffdb57',
          500: '#ffcb05',
          600: '#dcb000',
          700: '#b38e00',
          800: '#8a6d00',
          900: '#614d00',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
