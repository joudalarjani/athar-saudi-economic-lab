/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: {
          900: '#0A0E1A',
          800: '#10162A',
          700: '#1A2138',
          600: '#232C4A',
        },
        gold: {
          DEFAULT: '#C7A04A',
          light: '#FFD580',
          dark: '#9A7A2E',
        },
        emerald: {
          deep: '#0F6E4F',
          accent: '#15A578',
        },
        ivory: {
          DEFAULT: '#E8E9F0',
          dim: '#A8ABBA',
        },
        sector: {
          education: '#2DD4BF',
          health: '#FB7185',
          housing: '#F59E0B',
          employment: '#A78BFA',
          women: '#F472B6',
          environment: '#22C55E',
          hajj: '#818CF8',
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
