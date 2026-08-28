/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#1a2138',
          600: '#232c4a',
        },
        gold: {
          DEFAULT: '#d4a017',
          light: '#f0d67c',
          dark: '#9a7a2e',
        },
        emerald: {
          deep: '#10b981',
          accent: '#10b981',
        },
        ivory: {
          DEFAULT: '#f0e6d3',
          dim: '#c3b8a0',
        },
        sector: {
          education: '#2DD4BF',
          health: '#FB7185',
          housing: '#F59E0B',
          employment: '#A78BFA',
          women: '#F472B6',
          environment: '#22C55E',
          hajj: '#818CF8',
          hajjservices: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans Arabic', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'IBM Plex Sans Arabic', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'flow': 'flow 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        flow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
