/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // Dark Purple Theme for Qiaoqiaoban
        primary: {
          DEFAULT: '#4A148C', // Deep Purple
          foreground: '#FFFFFF',
          50: '#F3E5F5',
          100: '#E1BEE7',
          200: '#CE93D8',
          300: '#BA68C8',
          400: '#AB47BC',
          500: '#9C27B0',
          600: '#8E24AA',
          700: '#7B1FA2',
          800: '#6A1B9A', // Medium Purple
          900: '#4A148C', // Deep Purple
        },
        accent: {
          DEFAULT: '#E000B3', // Electric Magenta
          foreground: '#FFFFFF',
        },
        background: {
          DEFAULT: '#121212', // Near Black
          secondary: '#1E1E1E', // Dark Grey
        },
        surface: {
          DEFAULT: '#1E1E1E', // Dark Grey
          elevated: '#2A2A2A',
        },
        border: {
          DEFAULT: '#3A2B47', // Subtle Purple
          muted: '#2A2A2A',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B0B0B0',
          muted: '#808080',
        },
        success: '#00C853',
        error: '#D50000',
        warning: '#FF9800',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #E000B3' },
          '100%': { boxShadow: '0 0 20px #E000B3, 0 0 30px #E000B3' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}