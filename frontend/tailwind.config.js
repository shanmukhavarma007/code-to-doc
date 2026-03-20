/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0d0f12',
          surface: '#13161c',
          elevated: '#1a1f29',
          overlay: '#0a0c0f'
        },
        accent: {
          DEFAULT: '#00e5a0',
          dim: '#00a070',
          glow: '#00e5a020'
        },
        border: {
          DEFAULT: '#2a2f3d',
          focus: '#00e5a060'
        },
        text: {
          primary: '#e8eaf0',
          muted: '#6b7280',
          code: '#a8b5c8'
        },
        status: {
          success: '#00e5a0',
          warn: '#f5a623',
          danger: '#ff4444',
          info: '#60a5fa'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        cursor: 'blink 1s step-end infinite'
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        }
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
